# 🔌 FlashTix Backend API

Backend API cho hệ thống săn vé Flash Sale, được thiết kế để xử lý high-traffic với DynamoDB.

## 🏗️ Kiến trúc

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** Amazon DynamoDB (On-Demand Capacity)
- **SDK:** AWS SDK v3 (Modular)
- **Security:** AWS IAM Roles (ECS Task Role)

## 📁 Cấu trúc dự án

```
backend/
├── src/
│   ├── config/
│   │   └── dynamodb.js          # DynamoDB client configuration
│   ├── services/
│   │   ├── eventService.js      # Event operations
│   │   └── bookingService.js    # Booking operations
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   └── errorHandler.js     # Error handling
│   ├── routes/
│   │   ├── health.js            # Health check
│   │   ├── events.js            # Events endpoints
│   │   ├── bookings.js          # Bookings endpoints
│   │   └── admin.js             # Admin endpoints
│   └── index.js                 # Main server file
├── scripts/
│   └── seedData.js              # Seed initial data
├── .env.example                 # Environment variables template
├── Dockerfile
├── package.json
└── README.md
```

## 🚀 Cài đặt và chạy

### 1. Cài đặt dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình environment variables

Copy `.env.example` thành `.env` và điền thông tin:

```bash
cp .env.example .env
```

### 3. Setup DynamoDB Tables

Tạo 2 tables trong DynamoDB:

**Table: FlashTix_Events**
- Partition Key: `eventId` (String)
- Billing: On-Demand

**Table: FlashTix_Bookings**
- Partition Key: `bookingId` (String)
- Billing: On-Demand

### 4. Seed initial data

```bash
node scripts/seedData.js
```

### 5. Chạy development server

```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:5000`

## 📡 API Endpoints

### Base URL: `/api/v1`

### 1. Health Check

```http
GET /api/v1/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "FlashTix Backend API"
}
```

### 2. Get All Events

```http
GET /api/v1/events
```

**Response:**
```json
[
  {
    "eventId": "1",
    "name": "Taylor Swift - The Eras Tour",
    "totalTickets": 50000,
    "availableTickets": 1250,
    "status": "on_sale",
    "thumbnail": "...",
    "date": "2024-12-25",
    "time": "19:00",
    "location": "...",
    "description": "...",
    "price": 1500000,
    "saleStartTime": "..."
  }
]
```

### 3. Get Event by ID

```http
GET /api/v1/events/:id
```

**Response:**
```json
{
  "eventId": "1",
  "name": "Taylor Swift - The Eras Tour",
  "totalTickets": 50000,
  "availableTickets": 1250,
  "status": "on_sale",
  ...
}
```

**Error (404):**
```json
{
  "error": "Not Found",
  "message": "Sự kiện không tồn tại"
}
```

### 4. Create Booking (Buy Ticket)

```http
POST /api/v1/bookings
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "eventId": "1"
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "booking": {
    "bookingId": "uuid",
    "bookingReference": "BK1234567890",
    "eventId": "1",
    "eventName": "Taylor Swift - The Eras Tour",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response (Sold Out - 400):**
```json
{
  "error": "Sold Out",
  "message": "Vé đã hết, vui lòng thử lại sau"
}
```

**Response (Unauthorized - 401):**
```json
{
  "error": "Unauthorized",
  "message": "Missing authorization header"
}
```

**Lưu ý:** Endpoint này sử dụng **DynamoDB Conditional Write** để đảm bảo atomicity và tránh race condition.

### 5. Admin Reset

```http
POST /api/v1/admin/reset
```

**Response:**
```json
{
  "success": true,
  "message": "Database reset successfully",
  "deletedBookings": 100,
  "resetEvents": 5
}
```

⚠️ **WARNING:** Endpoint này xóa tất cả bookings và reset tickets về ban đầu!

## 🔐 Authentication

Hiện tại, authentication middleware extract `userId` từ Authorization header:

- Format: `Authorization: Bearer <jwt_token>`
- Nếu là JWT token, sẽ decode để lấy `sub` hoặc `userId`
- Nếu không phải JWT, sử dụng token trực tiếp làm `userId`

**TODO:** Trong production, cần verify JWT token với AWS Cognito.

## 🗄️ DynamoDB Tables

### Table: `FlashTix_Events`

- **Partition Key:** `eventId` (String)
- **Attributes:**
  - `name` (String)
  - `totalTickets` (Number)
  - `availableTickets` (Number) - Hot attribute
  - `status` (String) - "upcoming" | "on_sale" | "sold_out"
  - `thumbnail` (String)
  - `date` (String)
  - `time` (String)
  - `location` (String)
  - `description` (String)
  - `price` (Number)
  - `saleStartTime` (String - ISO)

### Table: `FlashTix_Bookings`

- **Partition Key:** `bookingId` (String - UUID)
- **Attributes:**
  - `eventId` (String)
  - `userId` (String)
  - `createdAt` (String - ISO)

## 🔄 Concurrency Handling

Endpoint `/api/v1/bookings` sử dụng **DynamoDB Conditional Write**:

```javascript
UpdateExpression: "SET availableTickets = availableTickets - :one"
ConditionExpression: "availableTickets > :zero"
```

Nếu `ConditionalCheckFailedException` → Vé đã hết → Return 400 Sold Out.

Điều này đảm bảo:
- ✅ Atomic operation (không thể oversell)
- ✅ Race condition safe
- ✅ High concurrency support

## 🐳 Docker

### Build image

```bash
docker build -t flashtix-backend .
```

### Run container

```bash
docker run -p 5000:5000 \
  -e AWS_REGION=ap-southeast-1 \
  -e DYNAMODB_EVENT_TABLE=FlashTix_Events \
  -e DYNAMODB_BOOKING_TABLE=FlashTix_Bookings \
  flashtix-backend
```

## 🚢 Deploy lên ECS

1. Build Docker image
2. Push lên ECR
3. Tạo ECS Task Definition với:
   - Environment variables
   - IAM Task Role (để access DynamoDB)
4. Deploy lên ECS Fargate

Xem chi tiết trong `docs/roadmap.md`.

## 🧪 Testing

### Test với curl

```bash
# Health check
curl http://localhost:5000/api/v1/health

# Get events
curl http://localhost:5000/api/v1/events

# Get event by ID
curl http://localhost:5000/api/v1/events/1

# Create booking (cần JWT token từ Cognito)
curl -X POST http://localhost:5000/api/v1/bookings \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"eventId": "1"}'

# Admin reset
curl -X POST http://localhost:5000/api/v1/admin/reset
```

## 📝 Notes

- DynamoDB On-Demand mode tự động scale
- Conditional writes đảm bảo không oversell tickets
- CORS được config để frontend có thể gọi API
- Error handling tự động format response
- Health check endpoint critical cho ALB health monitoring

## 🔗 Liên kết

- [Frontend Documentation](../frontend/README.md)
- [Backend Specifications](../docs/backend.md)
- [Architecture Overview](../docs/architecture.md)
