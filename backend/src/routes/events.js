import express from "express";
import { body, validationResult } from "express-validator";
import { getAllEvents, getEventById, createEvent } from "../services/eventService.js";

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

export default router;

