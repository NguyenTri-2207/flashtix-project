# 🧪 Hướng dẫn Test DynamoDB Connection

File này hướng dẫn cách test xem backend có thể kết nối và thao tác với AWS DynamoDB không.

## 📋 Yêu cầu trước khi test

1. **AWS Credentials đã được cấu hình:**
   - Cách 1: File `~/.aws/credentials` (Windows: `C:\Users\YourName\.aws\credentials`)
   - Cách 2: Environment variables trong `.env`:
     ```
     AWS_ACCESS_KEY_ID=your_access_key
     AWS_SECRET_ACCESS_KEY=your_secret_key
     AWS_REGION=ap-southeast-1
     ```

2. **DynamoDB Tables đã được tạo:**
   - `FlashTix_Events` (hoặc tên trong `.env`)
   - `FlashTix_Bookings` (hoặc tên trong `.env`)

3. **IAM Permissions:** User/Role cần có quyền:
   - `dynamodb:PutItem`
   - `dynamodb:GetItem`
   - `dynamodb:UpdateItem`
   - `dynamodb:DeleteItem`
   - `dynamodb:Scan`
   - `dynamodb:ListTables`

## 🚀 Cách chạy test

### Cách 1: Dùng npm script (khuyến nghị)

```bash
cd backend
npm run test:db
```

### Cách 2: Chạy trực tiếp

```bash
cd backend
node scripts/testDynamoDB.js
```

## ✅ Kết quả mong đợi

Script sẽ test 5 operations:

1. **Connection Test** - Kiểm tra kết nối với DynamoDB
2. **Write Test** - Ghi một event test vào database
3. **Read Test** - Đọc event vừa tạo
4. **Update Test** - Cập nhật event
5. **Delete Test** - Xóa event test (cleanup)

Nếu tất cả đều PASS, bạn sẽ thấy:

```
🎉 All tests passed! Backend can read/write to DynamoDB.
```

## 🔧 Troubleshooting

### Lỗi: "Failed to connect to DynamoDB"

**Nguyên nhân:**
- AWS credentials chưa được cấu hình
- Region không đúng
- Network issues

**Giải pháp:**
1. Kiểm tra AWS credentials:
   ```bash
   aws configure list
   ```

2. Kiểm tra `.env` file có đúng region không:
   ```
   AWS_REGION=ap-southeast-1
   ```

3. Test AWS CLI:
   ```bash
   aws dynamodb list-tables --region ap-southeast-1
   ```

### Lỗi: "Table not found"

**Nguyên nhân:**
- DynamoDB tables chưa được tạo

**Giải pháp:**
1. Tạo tables trong AWS Console hoặc dùng AWS CLI:
   ```bash
   aws dynamodb create-table \
     --table-name FlashTix_Events \
     --attribute-definitions AttributeName=eventId,AttributeType=S \
     --key-schema AttributeName=eventId,KeyType=HASH \
     --billing-mode PAY_PER_REQUEST \
     --region ap-southeast-1
   ```

2. Hoặc kiểm tra tên table trong `.env` có đúng không

### Lỗi: "Access Denied" hoặc "Unauthorized"

**Nguyên nhân:**
- IAM user/role không có đủ quyền

**Giải pháp:**
1. Kiểm tra IAM policy của user/role
2. Đảm bảo có các quyền DynamoDB cần thiết
3. Nếu dùng IAM role (ECS), kiểm tra Task Role

## 📝 Test thủ công qua API

Sau khi test script thành công, bạn có thể test qua API:

### 1. Test Health Check
```bash
curl http://localhost:5000/api/v1/health
```

### 2. Test GET Events
```bash
curl http://localhost:5000/api/v1/events
```

### 3. Test POST Event (tạo event mới)
```bash
curl -X POST http://localhost:5000/api/v1/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "eventId": "test-123",
    "name": "Test Event",
    "date": "2024-12-31",
    "time": "20:00",
    "location": "Test Venue",
    "totalTickets": 100,
    "price": 100000
  }'
```

### 4. Test GET Event by ID
```bash
curl http://localhost:5000/api/v1/events/test-123
```

## 🎯 Next Steps

Sau khi test thành công:

1. ✅ Backend có thể kết nối DynamoDB
2. ✅ Có thể ghi/đọc/update/delete data
3. 🚀 Có thể chạy backend server và test API endpoints
4. 🚀 Có thể seed data với `npm run seed`

