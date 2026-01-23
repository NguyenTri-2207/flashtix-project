import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Get AWS region from environment
const region = process.env.AWS_REGION || "ap-southeast-1";

// Create DynamoDB client
const client = new DynamoDBClient({
  region,
  // Credentials will be provided by ECS Task Role in production
  // For local dev, use AWS credentials from ~/.aws/credentials or environment
});

// Create DynamoDB Document Client for easier operations
export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false,
  },
});

// Table names from environment
export const TABLES = {
  EVENTS: process.env.DYNAMODB_EVENT_TABLE || "FlashTix_Events",
  BOOKINGS: process.env.DYNAMODB_BOOKING_TABLE || "FlashTix_Bookings",
};

export default client;

