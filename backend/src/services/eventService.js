import { docClient, TABLES } from "../config/dynamodb.js";
import * as DynamoDBLib from "@aws-sdk/lib-dynamodb";

const { ScanCommand, GetItemCommand, UpdateItemCommand, PutCommand } = DynamoDBLib;

/**
 * Get all events
 * @returns {Promise<Array>} List of events
 */
export async function getAllEvents() {
  try {
    const command = new ScanCommand({
      TableName: TABLES.EVENTS,
    });

    const response = await docClient.send(command);
    return response.Items || [];
  } catch (error) {
    console.error("Error getting events:", error);
    throw new Error("Failed to fetch events");
  }
}

/**
 * Get event by ID
 * @param {string} eventId
 * @returns {Promise<Object|null>} Event object or null
 */
export async function getEventById(eventId) {
  try {
    const command = new GetItemCommand({
      TableName: TABLES.EVENTS,
      Key: {
        eventId,
      },
    });

    const response = await docClient.send(command);
    return response.Item || null;
  } catch (error) {
    console.error("Error getting event:", error);
    throw new Error("Failed to fetch event");
  }
}

/**
 * Update available tickets (used internally by booking service)
 * @param {string} eventId
 * @param {number} decrement - Number to decrement (usually 1)
 * @returns {Promise<Object>} Updated event
 */
export async function decrementAvailableTickets(eventId, decrement = 1) {
  try {
    const command = new UpdateItemCommand({
      TableName: TABLES.EVENTS,
      Key: {
        eventId,
      },
      UpdateExpression: "SET availableTickets = availableTickets - :decrement",
      ConditionExpression: "availableTickets > :zero",
      ExpressionAttributeValues: {
        ":decrement": decrement,
        ":zero": 0,
      },
      ReturnValues: "ALL_NEW",
    });

    const response = await docClient.send(command);
    return response.Attributes;
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      throw new Error("SOLD_OUT");
    }
    console.error("Error updating event:", error);
    throw new Error("Failed to update event");
  }
}

/**
 * Create a new event
 * @param {Object} eventData - Event data
 * @returns {Promise<Object>} Created event
 */
export async function createEvent(eventData) {
  try {
    const command = new PutCommand({
      TableName: TABLES.EVENTS,
      Item: {
        eventId: eventData.eventId,
        name: eventData.name,
        thumbnail: eventData.thumbnail || "",
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        description: eventData.description || "",
        status: eventData.status || "upcoming",
        totalTickets: eventData.totalTickets,
        availableTickets: eventData.availableTickets || eventData.totalTickets,
        price: eventData.price,
        saleStartTime: eventData.saleStartTime || null,
      },
      ConditionExpression: "attribute_not_exists(eventId)", // Prevent overwrite
    });

    await docClient.send(command);
    return await getEventById(eventData.eventId);
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      throw new Error("EVENT_EXISTS");
    }
    console.error("Error creating event:", error);
    throw new Error("Failed to create event");
  }
}

/**
 * Reset available tickets to total tickets (admin function)
 * @param {string} eventId
 * @returns {Promise<Object>} Updated event
 */
export async function resetEventTickets(eventId) {
  try {
    // First get the event to get totalTickets
    const event = await getEventById(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const command = new UpdateItemCommand({
      TableName: TABLES.EVENTS,
      Key: {
        eventId,
      },
      UpdateExpression: "SET availableTickets = :total",
      ExpressionAttributeValues: {
        ":total": event.totalTickets,
      },
      ReturnValues: "ALL_NEW",
    });

    const response = await docClient.send(command);
    return response.Attributes;
  } catch (error) {
    console.error("Error resetting event:", error);
    throw new Error("Failed to reset event");
  }
}

