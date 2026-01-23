/**
 * Script to test DynamoDB connection and operations
 * Run: node scripts/testDynamoDB.js
 * 
 * This script tests:
 * 1. Connection to DynamoDB
 * 2. Write (PUT) operation
 * 3. Read (GET) operation
 * 4. Update operation
 * 5. Delete test data
 */

import { docClient, TABLES } from "../src/config/dynamodb.js";
import * as DynamoDBLib from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";

const { PutCommand, GetCommand, UpdateCommand, DeleteCommand } = DynamoDBLib;

dotenv.config();

const TEST_EVENT_ID = "TEST_EVENT_" + Date.now();

async function testConnection() {
  console.log("🔌 Testing DynamoDB connection...");
  try {
    // Try to list tables (simple operation to test connection)
    const { DynamoDBClient } = await import("@aws-sdk/client-dynamodb");
    const { ListTablesCommand } = await import("@aws-sdk/client-dynamodb");
    
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || "ap-southeast-1",
    });
    
    const command = new ListTablesCommand({});
    const response = await client.send(command);
    console.log("✅ Connected to DynamoDB successfully!");
    console.log(`   Region: ${process.env.AWS_REGION || "ap-southeast-1"}`);
    console.log(`   Tables found: ${response.TableNames?.length || 0}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to connect to DynamoDB:", error.message);
    console.error("\n💡 Troubleshooting:");
    console.error("   1. Check AWS credentials in ~/.aws/credentials");
    console.error("   2. Or set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env");
    console.error("   3. Check AWS_REGION in .env");
    console.error("   4. Ensure DynamoDB tables exist:", TABLES.EVENTS, TABLES.BOOKINGS);
    return false;
  }
}

async function testWrite() {
  console.log("\n📝 Testing WRITE operation (PUT)...");
  try {
    const testEvent = {
      eventId: TEST_EVENT_ID,
      name: "Test Event - DynamoDB Connection",
      thumbnail: "https://example.com/test.jpg",
      date: new Date().toISOString().split("T")[0],
      time: "20:00",
      location: "Test Venue",
      description: "This is a test event to verify DynamoDB write operation",
      status: "upcoming",
      totalTickets: 100,
      availableTickets: 100,
      price: 100000,
      saleStartTime: new Date().toISOString(),
    };

    const command = new PutCommand({
      TableName: TABLES.EVENTS,
      Item: testEvent,
    });

    await docClient.send(command);
    console.log("✅ Write operation successful!");
    console.log(`   Event ID: ${TEST_EVENT_ID}`);
    return true;
  } catch (error) {
    console.error("❌ Write operation failed:", error.message);
    if (error.name === "ResourceNotFoundException") {
      console.error("\n💡 Table not found! Please create the table:", TABLES.EVENTS);
    }
    return false;
  }
}

async function testRead() {
  console.log("\n📖 Testing READ operation (GET)...");
  try {
    const command = new GetCommand({
      TableName: TABLES.EVENTS,
      Key: {
        eventId: TEST_EVENT_ID,
      },
    });

    const response = await docClient.send(command);
    
    if (response.Item) {
      console.log("✅ Read operation successful!");
      console.log(`   Event Name: ${response.Item.name}`);
      console.log(`   Available Tickets: ${response.Item.availableTickets}`);
      return true;
    } else {
      console.error("❌ Event not found after write!");
      return false;
    }
  } catch (error) {
    console.error("❌ Read operation failed:", error.message);
    return false;
  }
}

async function testUpdate() {
  console.log("\n🔄 Testing UPDATE operation...");
  try {
    const command = new UpdateCommand({
      TableName: TABLES.EVENTS,
      Key: {
        eventId: TEST_EVENT_ID,
      },
      UpdateExpression: "SET availableTickets = :newValue, #status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":newValue": 50,
        ":status": "on_sale",
      },
      ReturnValues: "ALL_NEW",
    });

    const response = await docClient.send(command);
    console.log("✅ Update operation successful!");
    console.log(`   Updated availableTickets: ${response.Attributes.availableTickets}`);
    console.log(`   Updated status: ${response.Attributes.status}`);
    return true;
  } catch (error) {
    console.error("❌ Update operation failed:", error.message);
    return false;
  }
}

async function testDelete() {
  console.log("\n🗑️  Testing DELETE operation (cleanup)...");
  try {
    const command = new DeleteCommand({
      TableName: TABLES.EVENTS,
      Key: {
        eventId: TEST_EVENT_ID,
      },
    });

    await docClient.send(command);
    console.log("✅ Delete operation successful!");
    console.log("   Test data cleaned up.");
    return true;
  } catch (error) {
    console.error("❌ Delete operation failed:", error.message);
    return false;
  }
}

async function runTests() {
  console.log("🧪 Starting DynamoDB Connection Tests\n");
  console.log("=" .repeat(50));
  
  const results = {
    connection: false,
    write: false,
    read: false,
    update: false,
    delete: false,
  };

  // Test 1: Connection
  results.connection = await testConnection();
  if (!results.connection) {
    console.log("\n❌ Connection failed. Please fix connection issues first.");
    process.exit(1);
  }

  // Test 2: Write
  results.write = await testWrite();
  if (!results.write) {
    console.log("\n❌ Write failed. Cannot continue with other tests.");
    process.exit(1);
  }

  // Test 3: Read
  results.read = await testRead();
  
  // Test 4: Update
  results.update = await testUpdate();
  
  // Test 5: Delete (cleanup)
  results.delete = await testDelete();

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 Test Summary:");
  console.log("=".repeat(50));
  console.log(`Connection: ${results.connection ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Write:      ${results.write ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Read:       ${results.read ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Update:     ${results.update ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Delete:     ${results.delete ? "✅ PASS" : "❌ FAIL"}`);
  console.log("=".repeat(50));

  const allPassed = Object.values(results).every((r) => r === true);
  if (allPassed) {
    console.log("\n🎉 All tests passed! Backend can read/write to DynamoDB.");
    process.exit(0);
  } else {
    console.log("\n⚠️  Some tests failed. Please check the errors above.");
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error("\n💥 Unexpected error:", error);
  process.exit(1);
});

