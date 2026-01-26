import { docClient, TABLES } from "../config/dynamodb.js";
import * as DynamoDBLib from "@aws-sdk/lib-dynamodb";

const { ScanCommand, GetCommand, UpdateCommand, PutCommand, DeleteCommand } = DynamoDBLib;

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
    const command = new GetCommand({
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
    const command = new UpdateCommand({
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
    // Prepare event item
    const eventItem = {
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
    };

    const command = new PutCommand({
      TableName: TABLES.EVENTS,
      Item: eventItem,
      ConditionExpression: "attribute_not_exists(eventId)", // Prevent overwrite
    });

    await docClient.send(command);
    
    // Return the created event directly (no need to query again)
    return eventItem;
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      throw new Error("EVENT_EXISTS");
    }
    if (error.name === "ResourceNotFoundException") {
      console.error("DynamoDB table not found:", TABLES.EVENTS);
      throw new Error(`Table ${TABLES.EVENTS} does not exist. Please create it first.`);
    }
    if (error.name === "UnrecognizedClientException" || error.name === "InvalidSignatureException") {
      console.error("AWS credentials error:", error.message);
      throw new Error("AWS credentials are invalid or missing. Please check your AWS configuration.");
    }
    console.error("Error creating event:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw new Error(`Failed to create event: ${error.message}`);
  }
}

/**
 * Update an existing event
 * @param {string} eventId
 * @param {Object} eventData - Updated event data
 * @returns {Promise<Object>} Updated event
 */
export async function updateEvent(eventId, eventData) {
  try {
    // Check if event exists
    const existingEvent = await getEventById(eventId);
    if (!existingEvent) {
      throw new Error("Event not found");
    }

    // Prepare final values for validation
    const finalTotalTickets = eventData.totalTickets !== undefined 
      ? eventData.totalTickets 
      : existingEvent.totalTickets;
    
    const finalAvailableTickets = eventData.availableTickets !== undefined 
      ? eventData.availableTickets 
      : existingEvent.availableTickets;

    // Validate: availableTickets cannot exceed totalTickets
    if (finalAvailableTickets > finalTotalTickets) {
      throw new Error("availableTickets cannot exceed totalTickets");
    }

    // Build update expression dynamically
    const updateExpressions = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    // Helper to check if value is provided (not undefined and not empty string for required fields)
    const hasValue = (value) => value !== undefined && value !== null && value !== "";

    if (hasValue(eventData.name)) {
      updateExpressions.push("#name = :name");
      expressionAttributeNames["#name"] = "name";
      expressionAttributeValues[":name"] = String(eventData.name).trim();
    }
    
    if (eventData.thumbnail !== undefined) {
      updateExpressions.push("thumbnail = :thumbnail");
      expressionAttributeValues[":thumbnail"] = eventData.thumbnail || "";
    }
    
    if (hasValue(eventData.date)) {
      updateExpressions.push("#date = :date");
      expressionAttributeNames["#date"] = "date";
      expressionAttributeValues[":date"] = String(eventData.date).trim();
    }
    
    if (hasValue(eventData.time)) {
      updateExpressions.push("#time = :time");
      expressionAttributeNames["#time"] = "time";
      expressionAttributeValues[":time"] = String(eventData.time).trim();
    }
    
    if (hasValue(eventData.location)) {
      updateExpressions.push("#location = :location");
      expressionAttributeNames["#location"] = "location";
      expressionAttributeValues[":location"] = String(eventData.location).trim();
    }
    
    if (eventData.description !== undefined) {
      updateExpressions.push("#description = :description");
      expressionAttributeNames["#description"] = "description";
      expressionAttributeValues[":description"] = eventData.description || "";
    }
    
    if (eventData.status !== undefined) {
      const validStatuses = ["upcoming", "on_sale", "sold_out"];
      if (!validStatuses.includes(eventData.status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
      }
      updateExpressions.push("#status = :status");
      expressionAttributeNames["#status"] = "status";
      expressionAttributeValues[":status"] = eventData.status;
    }
    
    if (eventData.totalTickets !== undefined) {
      const totalTickets = parseInt(eventData.totalTickets);
      if (isNaN(totalTickets) || totalTickets < 1) {
        throw new Error("totalTickets must be a positive integer");
      }
      updateExpressions.push("totalTickets = :totalTickets");
      expressionAttributeValues[":totalTickets"] = totalTickets;
    }
    
    if (eventData.availableTickets !== undefined) {
      const availableTickets = parseInt(eventData.availableTickets);
      if (isNaN(availableTickets) || availableTickets < 0) {
        throw new Error("availableTickets must be a non-negative integer");
      }
      updateExpressions.push("availableTickets = :availableTickets");
      expressionAttributeValues[":availableTickets"] = availableTickets;
    }
    
    if (eventData.price !== undefined) {
      const price = parseInt(eventData.price);
      if (isNaN(price) || price < 0) {
        throw new Error("price must be a non-negative integer");
      }
      updateExpressions.push("#price = :price");
      expressionAttributeNames["#price"] = "price";
      expressionAttributeValues[":price"] = price;
    }
    
    if (eventData.saleStartTime !== undefined) {
      // Handle empty string, null, or valid ISO string
      if (eventData.saleStartTime === "" || eventData.saleStartTime === null) {
        updateExpressions.push("saleStartTime = :saleStartTime");
        expressionAttributeValues[":saleStartTime"] = null;
      } else {
        // Validate ISO string format
        const date = new Date(eventData.saleStartTime);
        if (isNaN(date.getTime())) {
          throw new Error("saleStartTime must be a valid ISO date string");
        }
        updateExpressions.push("saleStartTime = :saleStartTime");
        expressionAttributeValues[":saleStartTime"] = date.toISOString();
      }
    }

    if (updateExpressions.length === 0) {
      // No updates, return existing event
      return existingEvent;
    }

    const command = new UpdateCommand({
      TableName: TABLES.EVENTS,
      Key: {
        eventId,
      },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    });

    const response = await docClient.send(command);
    return response.Attributes;
  } catch (error) {
    if (error.message === "Event not found" || 
        error.message.includes("cannot exceed") ||
        error.message.includes("must be") ||
        error.message.includes("Invalid status")) {
      throw error;
    }
    console.error("Error updating event:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      code: error.code,
    });
    throw new Error(`Failed to update event: ${error.message}`);
  }
}

/**
 * Delete an event
 * @param {string} eventId
 * @returns {Promise<boolean>} True if deleted
 */
export async function deleteEvent(eventId) {
  try {
    // Check if event exists
    const event = await getEventById(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const command = new DeleteCommand({
      TableName: TABLES.EVENTS,
      Key: {
        eventId,
      },
    });

    await docClient.send(command);
    return true;
  } catch (error) {
    if (error.message === "Event not found") {
      throw error;
    }
    console.error("Error deleting event:", error);
    throw new Error("Failed to delete event");
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

    const command = new UpdateCommand({
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

