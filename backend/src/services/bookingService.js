import { docClient, TABLES } from "../config/dynamodb.js";
import * as DynamoDBLib from "@aws-sdk/lib-dynamodb";
import { decrementAvailableTickets, getEventById } from "./eventService.js";
import { randomUUID } from "crypto";

const { PutCommand, ScanCommand, DeleteCommand } = DynamoDBLib;

/**
 * Create a new booking
 * Uses conditional write to ensure atomicity
 * @param {string} eventId
 * @param {string} userId
 * @returns {Promise<Object>} Created booking
 */
export async function createBooking(eventId, userId) {
  try {
    // Step 1: Decrement available tickets (with condition check)
    // This will throw if tickets are sold out
    const updatedEvent = await decrementAvailableTickets(eventId, 1);

    // Step 2: Create booking record
    const bookingId = randomUUID();
    const booking = {
      bookingId,
      eventId,
      userId,
      createdAt: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: TABLES.BOOKINGS,
      Item: booking,
    });

    await docClient.send(command);

    return {
      ...booking,
      bookingReference: `BK${Date.now()}`,
      eventName: updatedEvent.name,
    };
  } catch (error) {
    if (error.message === "SOLD_OUT") {
      throw new Error("SOLD_OUT");
    }
    console.error("Error creating booking:", error);
    throw new Error("Failed to create booking");
  }
}

/**
 * Get all bookings (admin function)
 * @returns {Promise<Array>} List of bookings
 */
export async function getAllBookings() {
  try {
    const command = new ScanCommand({
      TableName: TABLES.BOOKINGS,
    });

    const response = await docClient.send(command);
    return response.Items || [];
  } catch (error) {
    console.error("Error getting bookings:", error);
    throw new Error("Failed to fetch bookings");
  }
}

/**
 * Delete all bookings (admin reset function)
 * @returns {Promise<number>} Number of deleted items
 */
export async function deleteAllBookings() {
  try {
    // Get all bookings
    const bookings = await getAllBookings();

    // Delete each booking
    const deletePromises = bookings.map((booking) => {
      const command = new DeleteCommand({
        TableName: TABLES.BOOKINGS,
        Key: {
          bookingId: booking.bookingId,
        },
      });
      return docClient.send(command);
    });

    await Promise.all(deletePromises);
    return bookings.length;
  } catch (error) {
    console.error("Error deleting bookings:", error);
    throw new Error("Failed to delete bookings");
  }
}

