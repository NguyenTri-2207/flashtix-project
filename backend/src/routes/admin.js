import express from "express";
import * as DynamoDBLib from "@aws-sdk/lib-dynamodb";
import { docClient, TABLES } from "../config/dynamodb.js";
import { resetEventTickets } from "../services/eventService.js";
import { deleteAllBookings } from "../services/bookingService.js";

const { ScanCommand } = DynamoDBLib;

const router = express.Router();

/**
 * POST /api/v1/admin/reset
 * Reset database:
 * - Delete all bookings
 * - Reset availableTickets to totalTickets for all events
 * 
 * WARNING: This is a destructive operation!
 */
router.post("/reset", async (req, res, next) => {
  try {
    // Step 1: Delete all bookings
    const deletedCount = await deleteAllBookings();

    // Step 2: Reset all events
    // Get all events
    const scanCommand = new ScanCommand({
      TableName: TABLES.EVENTS,
    });

    const eventsResponse = await docClient.send(scanCommand);
    const events = eventsResponse.Items || [];

    // Reset each event
    const resetPromises = events.map((event) =>
      resetEventTickets(event.eventId)
    );

    await Promise.all(resetPromises);

    res.json({
      success: true,
      message: "Database reset successfully",
      deletedBookings: deletedCount,
      resetEvents: events.length,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

