import express from "express";
import { body, validationResult } from "express-validator";
import { createBooking, getAllBookings } from "../services/bookingService.js";
import { extractUserId } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/v1/bookings
 * Create a new booking (buy ticket)
 * Requires authentication
 */
router.post(
  "/",
  extractUserId, // Require authentication
  [
    body("eventId")
      .notEmpty()
      .withMessage("eventId is required")
      .isString()
      .withMessage("eventId must be a string"),
  ],
  async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation Error",
          message: errors.array()[0].msg,
          errors: errors.array(),
        });
      }

      const { eventId } = req.body;
      const userId = req.userId; // From auth middleware

      // Create booking (with atomic ticket decrement)
      const booking = await createBooking(eventId, userId);

      res.status(201).json({
        success: true,
        booking: {
          bookingId: booking.bookingId,
          bookingReference: booking.bookingReference,
          eventId: booking.eventId,
          eventName: booking.eventName,
          createdAt: booking.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/v1/bookings
 * Get all bookings (admin function)
 */
router.get("/", async (req, res, next) => {
  try {
    const bookings = await getAllBookings();
    res.json(bookings);
  } catch (error) {
    next(error);
  }
});

export default router;

