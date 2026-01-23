# AWS Cognito Authentication Setup

## 1. Tạo Cognito User Pool trên AWS

1. Vào AWS Console > Cognito > User Pools
2. Tạo User Pool mới:
   - **Sign-in options**: Email
   - **Password policy**: Tùy chỉnh (khuyến nghị: tối thiểu 8 ký tự)
   - **MFA**: Optional (có thể bật sau)
   - **User pool name**: `FlashTix-UserPool` (hoặc tên khác)

3. Tạo App Client:
   - Vào User Pool > App integration > App clients
   - Tạo app client mới
   - **App client name**: `FlashTix-WebClient`
   - **Auth flows**: Chọn "ALLOW_USER_PASSWORD_AUTH" và "ALLOW_REFRESH_TOKEN_AUTH"
   - Lưu lại **Client ID**

## 2. Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục `frontend/`:

```env
NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-southeast-1_xxxxxxxxx
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
```

**Lưu ý:**
- `NEXT_PUBLIC_*` là prefix bắt buộc cho Next.js client-side env vars
- User Pool ID có format: `{region}_{random_string}`
- Client ID là chuỗi dài không có dấu gạch ngang

## 3. Deploy lên ECS

Khi deploy lên ECS, cần set environment variables trong:
- **ECS Task Definition** > Container Definitions > Environment variables
- Hoặc dùng **AWS Systems Manager Parameter Store** / **Secrets Manager**

### Cách 1: ECS Task Definition
```json
{
  "environment": [
    {
      "name": "NEXT_PUBLIC_COGNITO_USER_POOL_ID",
      "value": "ap-southeast-1_xxxxxxxxx"
    },
    {
      "name": "NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID",
      "value": "xxxxxxxxxxxxxxxxxxxxxxxxxx"
    },
    {
      "name": "NEXT_PUBLIC_AWS_REGION",
      "value": "ap-southeast-1"
    }
  ]
}
```

### Cách 2: Parameter Store (Recommended)
1. Tạo parameters trong Systems Manager Parameter Store
2. Thêm IAM policy cho ECS Task Role để đọc parameters
3. Sử dụng ECS Task Definition với `secrets` field

## 4. Test Authentication

1. Tạo user test trong Cognito Console hoặc qua signup page
2. Đăng nhập qua `/login`
3. Kiểm tra user menu ở header
4. Test logout

## 5. Troubleshooting

### Lỗi: "User pool not found"
- Kiểm tra `NEXT_PUBLIC_COGNITO_USER_POOL_ID` có đúng format không
- Kiểm tra region có khớp không

### Lỗi: "Invalid client"
- Kiểm tra `NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID`
- Đảm bảo App Client đã enable "ALLOW_USER_PASSWORD_AUTH"

### User không hiển thị sau login
- Kiểm tra browser console có lỗi không
- Kiểm tra AuthProvider đã wrap đúng trong layout chưa

## 6. Security Best Practices

- ✅ Không commit `.env.local` vào git
- ✅ Sử dụng IAM roles cho ECS (không hardcode credentials)
- ✅ Enable MFA cho production
- ✅ Set up proper CORS trong Cognito App Client settings
- ✅ Sử dụng HTTPS trong production

