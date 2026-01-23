# 🔧 Quick Setup Guide - AWS Cognito Authentication

## Lỗi "Auth UserPool not configured" - Cách sửa

### Bước 1: Tạo file `.env.local`

Tạo file `.env.local` trong thư mục `frontend/` với nội dung:

```env
NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-southeast-1_xxxxxxxxx
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
```

### Bước 2: Lấy thông tin từ AWS Cognito

1. **User Pool ID:**
   - Vào AWS Console > Cognito > User Pools
   - Chọn User Pool của bạn
   - Copy **User pool ID** (format: `ap-southeast-1_xxxxxxxxx`)

2. **Client ID:**
   - Trong User Pool, vào **App integration** > **App clients**
   - Chọn App Client của bạn
   - Copy **Client ID** (chuỗi dài không có dấu gạch ngang)

3. **Region:**
   - Region nơi bạn tạo User Pool (ví dụ: `ap-southeast-1`)

### Bước 3: Restart Dev Server

Sau khi tạo/update file `.env.local`, **bắt buộc phải restart** dev server:

```bash
# Dừng server hiện tại (Ctrl+C)
# Sau đó chạy lại:
npm run dev
```

**⚠️ Lưu ý:** Next.js chỉ load environment variables khi khởi động, nên phải restart sau mỗi lần thay đổi `.env.local`.

### Bước 4: Kiểm tra Console

Mở browser console (F12), bạn sẽ thấy:
- ✅ `Amplify configured successfully` - Nếu config đúng
- ⚠️ `AWS Cognito configuration missing...` - Nếu thiếu env vars

### Bước 5: Test Authentication

1. Truy cập `/signup` để tạo tài khoản mới
2. Kiểm tra email để lấy mã xác nhận
3. Xác nhận tài khoản
4. Đăng nhập tại `/login`

## Troubleshooting

### Vẫn bị lỗi sau khi set env vars?

1. **Kiểm tra file `.env.local` có đúng tên không:**
   - Phải là `.env.local` (có dấu chấm ở đầu)
   - Phải nằm trong thư mục `frontend/`

2. **Kiểm tra format env vars:**
   ```env
   # ✅ ĐÚNG
   NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-southeast-1_AbCdEfGh
   
   # ❌ SAI - Không có dấu cách, không có quotes
   NEXT_PUBLIC_COGNITO_USER_POOL_ID = "ap-southeast-1_AbCdEfGh"
   ```

3. **Restart lại dev server:**
   ```bash
   # Dừng hoàn toàn (Ctrl+C)
   # Xóa cache nếu cần
   rm -rf .next
   # Chạy lại
   npm run dev
   ```

4. **Kiểm tra browser console:**
   - Mở DevTools (F12)
   - Xem tab Console
   - Tìm các message về Amplify config

### Lỗi "Invalid client" hoặc "User pool not found"

- Kiểm tra User Pool ID và Client ID có đúng không
- Đảm bảo region khớp với region của User Pool
- Kiểm tra App Client đã enable "ALLOW_USER_PASSWORD_AUTH" chưa

## Development vs Production

### Development (Local)
- Sử dụng file `.env.local`
- File này **KHÔNG** được commit vào git (đã có trong `.gitignore`)

### Production (ECS)
- Set environment variables trong ECS Task Definition
- Hoặc dùng AWS Systems Manager Parameter Store
- Xem chi tiết trong `lib/auth/README.md`

