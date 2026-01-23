# 🔌 Backend Detailed Specifications (DynamoDB Edition)

## 1. Technology Decisions
* **Runtime:** Node.js (v18+).
* **Framework:** Express.js.
* **Database:** **Amazon DynamoDB**.
    * **Mode:** On-Demand Capacity (Serverless).
    * **SDK:** AWS SDK v3 (Modular, lighter image size).
* **Security:** **AWS IAM Roles for Tasks** (No hardcoded credentials).

## 2. Database Design (DynamoDB Tables)

Since DynamoDB is NoSQL Key-Value, we design based on access patterns.

### 2.1. Table: `FlashTix_Events`
Stores event inventory.
* **Partition Key (PK):** `eventId` (String)
* **Attributes:**
    * `name` (String)
    * `totalTickets` (Number)
    * `availableTickets` (Number) **<-- Hot Attribute**
    * `status` (String)

### 2.2. Table: `FlashTix_Bookings`
Stores successful transactions.
* **Partition Key (PK):** `bookingId` (String - UUID)
* **Attributes:**
    * `eventId` (String)
    * `userId` (String)
    * `createdAt` (String - ISO Date)

## 3. API Endpoints

**Base URL:** `/api/v1`

### 3.1. System & Operations

| Method | Endpoint | Description | Implementation Note |
| :--- | :--- | :--- | :--- |
| **GET** | `/health` | Health Check | Returns `200 OK`. Critical for ALB & ECS health monitoring. |
| **POST** | `/admin/reset` | Reset DB | Scans and deletes all items in Bookings table; Resets `availableTickets` in Events table. |

### 3.2. Business Logic (The "Wow" Part)

| Method | Endpoint | Description | Logic Highlight (Concurrency Handling) |
| :--- | :--- | :--- | :--- |
| **GET** | `/events` | List Events | `Scan` or `Query` DynamoDB table. |
| **POST** | `/bookings` | **Buy Ticket** | **DynamoDB Conditional Write Strategy:**<br>Use `UpdateItem` command.<br>**ConditionExpression:** `availableTickets > :zero`<br>**UpdateExpression:** `SET availableTickets = availableTickets - :one`<br><br>If DynamoDB throws `ConditionalCheckFailedException`, it means the ticket was sold out milliseconds ago. Return `400 Sold Out`. |

## 4. Environment Variables (`.env`)
Notice: No Username/Password here!

```ini
PORT=5000
AWS_REGION=ap-southeast-1
DYNAMODB_EVENT_TABLE=FlashTix_Events
DYNAMODB_BOOKING_TABLE=FlashTix_Bookings
# AWS_ACCESS_KEY_ID & SECRET are injected automatically by ECS Task Role