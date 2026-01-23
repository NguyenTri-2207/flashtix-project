# 🧪 Postman Test Guide - FlashTix API

Quick guide để test API trong Postman.

## 🔗 Base URL

```
http://localhost:5000/api/v1
```

---

## 📋 Endpoints

### 1. Health Check

**GET** `/health`

Kiểm tra server hoạt động

---

### 2. Get All Events

**GET** `/events`

Lấy danh sách tất cả events

---

### 3. Get Event by ID

**GET** `/events/:id`

Lấy thông tin chi tiết event theo ID

**Params:** `id = "1"`

---

### 4. Create Event

**POST** `/events`

Tạo event mới

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "eventId": "6",
  "name": "Taylor Swift - The Eras Tour",
  "thumbnail": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop",
  "date": "2025-03-15",
  "time": "20:00",
  "location": "Sân vận động Quốc gia Mỹ Đình, Hà Nội",
  "description": "Buổi biểu diễn đặc biệt của Taylor Swift với các hit từ tất cả các era.",
  "status": "upcoming",
  "totalTickets": 50000,
  "availableTickets": 50000,
  "price": 2000000,
  "saleStartTime": "2025-03-01T00:00:00.000Z"
}
```

**Response:** `201 Created` hoặc `409 Conflict` (nếu eventId đã tồn tại)

---

### 5. Create Booking (Buy Ticket)

**POST** `/bookings`

Mua vé - yêu cầu authentication

**Headers:**
```
Authorization: Bearer user123
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "eventId": "1"
}
```

**Response:** `201 Created` (success) hoặc `400` (sold out) hoặc `401` (no auth)

---

### 6. Admin Reset

**POST** `/admin/reset`

Reset database (xóa bookings, reset tickets)

**Body:** Không có

**Response:** `200 OK`

---

## 📊 Test Data

**Event IDs:** `"1"`, `"2"`, `"3"`, `"4"`, `"5"`  
**User ID:** `"user123"`

---

## ✅ Quick Checklist

- [ ] GET `/health` → 200
- [ ] GET `/events` → 200
- [ ] GET `/events/1` → 200
- [ ] POST `/events` → 201
- [ ] POST `/bookings` (no auth) → 401
- [ ] POST `/bookings` (valid) → 201
- [ ] POST `/admin/reset` → 200
