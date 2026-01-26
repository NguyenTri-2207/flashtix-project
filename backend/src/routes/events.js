import express from "express";
import { body, validationResult } from "express-validator";
import { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } from "../services/eventService.js";

const router = express.Router();

/**
 * GET /api/v1/events
 * Get all events
 */
router.get("/", async (req, res, next) => {
  try {
    const events = await getAllEvents();
    res.json(events);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/events/:id
 * Get event by ID
 */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await getEventById(id);

    if (!event) {
      return res.status(404).json({
        error: "Not Found",
        message: "Sự kiện không tồn tại",
      });
    }

    res.json(event);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/events
 * Create a new event
 */
router.post(
  "/",
  [
    body("eventId").notEmpty().withMessage("eventId is required").isString(),
    body("name").notEmpty().withMessage("name is required").isString(),
    body("date").notEmpty().withMessage("date is required").isString(),
    body("time").notEmpty().withMessage("time is required").isString(),
    body("location").notEmpty().withMessage("location is required").isString(),
    body("status").optional().isIn(["upcoming", "on_sale", "sold_out"]),
    body("totalTickets").notEmpty().withMessage("totalTickets is required").isInt({ min: 1 }),
    body("price").notEmpty().withMessage("price is required").isInt({ min: 0 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation Error",
          message: errors.array()[0].msg,
          errors: errors.array(),
        });
      }

      const event = await createEvent(req.body);

      res.status(201).json({
        success: true,
        event,
      });
    } catch (error) {
      if (error.message === "EVENT_EXISTS") {
        return res.status(409).json({
          error: "Conflict",
          message: "Event ID đã tồn tại",
        });
      }
      next(error);
    }
  }
);

/**
 * PUT /api/v1/events/:id
 * Update an existing event
 * All fields are optional - only provided fields will be updated
 */
router.put(
  "/:id",
  [
    body("name").optional().isString().notEmpty().withMessage("name must be a non-empty string"),
    body("thumbnail").optional().isString(),
    body("date").optional().isString().notEmpty().withMessage("date must be a non-empty string"),
    body("time").optional().isString().notEmpty().withMessage("time must be a non-empty string"),
    body("location").optional().isString().notEmpty().withMessage("location must be a non-empty string"),
    body("description").optional().isString(),
    body("status").optional().isIn(["upcoming", "on_sale", "sold_out"]).withMessage("status must be one of: upcoming, on_sale, sold_out"),
    body("totalTickets").optional().isInt({ min: 1 }).withMessage("totalTickets must be a positive integer"),
    body("availableTickets").optional().isInt({ min: 0 }).withMessage("availableTickets must be a non-negative integer"),
    body("price").optional().isInt({ min: 0 }).withMessage("price must be a non-negative integer"),
    body("saleStartTime").optional().custom((value) => {
      if (value === null || value === "") return true; // Allow null/empty
      return new Date(value).toString() !== "Invalid Date";
    }).withMessage("saleStartTime must be a valid ISO 8601 date string or empty"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation Error",
          message: errors.array()[0].msg,
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      
      // Check if at least one field is provided
      const hasUpdates = Object.keys(req.body).length > 0;
      if (!hasUpdates) {
        return res.status(400).json({
          error: "Bad Request",
          message: "At least one field must be provided for update",
        });
      }

      const event = await updateEvent(id, req.body);

      res.json({
        success: true,
        event,
      });
    } catch (error) {
      if (error.message === "Event not found") {
        return res.status(404).json({
          error: "Not Found",
          message: "Sự kiện không tồn tại",
        });
      }
      if (error.message.includes("cannot exceed") || 
          error.message.includes("must be") ||
          error.message.includes("Invalid status")) {
        return res.status(400).json({
          error: "Bad Request",
          message: error.message,
        });
      }
      next(error);
    }
  }
);

/**
 * DELETE /api/v1/events/:id
 * Delete an event
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteEvent(id);

    res.json({
      success: true,
      message: "Event đã được xóa thành công",
    });
  } catch (error) {
    if (error.message === "Event not found") {
      return res.status(404).json({
        error: "Not Found",
        message: "Sự kiện không tồn tại",
      });
    }
    next(error);
  }
});

export default router;

