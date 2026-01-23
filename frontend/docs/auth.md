# 🔐 Authentication System Documentation

Tài liệu này giải thích chi tiết cách hệ thống authentication được implement với AWS Cognito và AWS Amplify.

## 📋 Mục lục

1. [Tổng quan kiến trúc](#tổng-quan-kiến-trúc)
2. [Cấu trúc Files](#cấu-trúc-files)
3. [Implementation từng bước](#implementation-từng-bước)
4. [Authentication Flow](#authentication-flow)
5. [Customization Guide](#customization-guide)
6. [Troubleshooting](#troubleshooting)

---

## 🏗️ Tổng quan kiến trúc

### Tech Stack
- **AWS Cognito**: User authentication service
- **AWS Amplify v6**: SDK để tương tác với Cognito
- **Next.js 16**: App Router với Server/Client Components
- **React Context API**: State management cho auth state
- **TypeScript**: Type safety

### Kiến trúc Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Root Layout                           │
│  ┌───────────────────────────────────────────────────┐  │
│  │         AmplifyProvider (Client)                  │  │
│  │  - Initialize Amplify config                      │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │         ToastProvider                             │  │
│  │  - Toast notifications                            │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │         AuthProvider (Client)                      │  │
│  │  - Auth state management                          │  │
│  │  - Login/Logout functions                         │  │
│  │  - User info from Cognito                         │  │
│  └───────────────────────────────────────────────────┘  │
│                    App Components                        │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Cấu trúc Files

```
frontend/
├── lib/auth/
│   ├── config.ts              # Amplify configuration
│   ├── auth-context.tsx        # Auth Context & Provider
│   └── README.md               # Setup guide
├── components/
│   ├── auth/
│   │   └── amplify-provider.tsx  # Client-side Amplify init
│   └── layout/
│       └── user-menu.tsx       # User dropdown menu
├── app/
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── signup/
│   │   └── page.tsx            # Signup page
│   └── layout.tsx              # Root layout với providers
└── middleware.ts                # Route protection (future)
```

---

## 🔧 Implementation từng bước

### Bước 1: Cài đặt Dependencies

```bash
npm install aws-amplify @aws-amplify/ui-react
```

**Lý do:**
- `aws-amplify`: Core SDK để tương tác với AWS services
- `@aws-amplify/ui-react`: UI components (optional, không dùng trong project này)

---

### Bước 2: Tạo Amplify Configuration (`lib/auth/config.ts`)

**Mục đích:** Cấu hình kết nối với AWS Cognito

**Chi tiết:**

```typescript
// 1. Lấy environment variables
const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const userPoolClientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID;
const region = process.env.NEXT_PUBLIC_AWS_REGION || "ap-southeast-1";

// 2. Validate env vars
if (!userPoolId || !userPoolClientId) {
  console.warn("⚠️ AWS Cognito configuration missing...");
}

// 3. Tạo config object
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: userPoolId || "",
      userPoolClientId: userPoolClientId || "",
      region: region,
      loginWith: {
        email: true,      // Cho phép login bằng email
        username: false,  // Không cho phép login bằng username
        phone: false,     // Không cho phép login bằng phone
      },
    },
  },
};

// 4. Export function để configure
export function configureAmplify() {
  if (typeof window === "undefined") return; // Skip server-side
  if (!userPoolId || !userPoolClientId) return; // Skip nếu thiếu config
  
  Amplify.configure(amplifyConfig);
}
```

**Lưu ý quan trọng:**
- `NEXT_PUBLIC_*` prefix là bắt buộc cho client-side env vars trong Next.js
- Chỉ configure ở client-side (`typeof window !== "undefined"`)
- Validate trước khi configure để tránh lỗi runtime

---

### Bước 3: Tạo AmplifyProvider (`components/auth/amplify-provider.tsx`)

**Mục đích:** Đảm bảo Amplify được configure đúng cách sau khi component mount

**Chi tiết:**

```typescript
"use client";

export function AmplifyProvider({ children }) {
  useEffect(() => {
    // Chỉ chạy ở client-side sau khi component mount
    configureAmplify();
  }, []);

  return <>{children}</>;
}
```

**Lý do tách riêng:**
- Next.js App Router có Server/Client Components
- Cần đảm bảo Amplify chỉ được init ở client-side
- useEffect đảm bảo chạy sau khi component đã mount

---

### Bước 4: Tạo Auth Context (`lib/auth/auth-context.tsx`)

**Mục đích:** Quản lý authentication state và cung cấp auth functions cho toàn app

#### 4.1. User Interface

```typescript
interface User {
  userId: string;      // Cognito User ID
  email?: string;      // Email từ token
  username?: string;   // Username từ Cognito
  name?: string;       // Full Name từ signup
}
```

#### 4.2. Auth Context Interface

```typescript
interface AuthContextType {
  user: User | null;           // Current user hoặc null
  isLoading: boolean;          // Đang check auth state
  isAuthenticated: boolean;    // Shorthand: !!user
  login: (email, password) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}
```

#### 4.3. checkAuth() Function

**Mục đích:** Kiểm tra xem user đã đăng nhập chưa khi app load

**Flow:**
1. Kiểm tra Cognito config có sẵn không
2. Gọi `getCurrentUser()` từ Amplify
3. Nếu có user → Fetch session để lấy email và name từ token
4. Set user state
5. Nếu không có user → Set user = null (silent fail)

```typescript
const checkAuth = async () => {
  try {
    // 1. Check config
    const userPoolId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
    if (!userPoolId) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    // 2. Get current user
    const currentUser = await getCurrentUser();
    
    // 3. Fetch session để lấy attributes từ token
    const session = await fetchAuthSession();
    const tokenPayload = session.tokens?.idToken?.payload as any;
    const email = tokenPayload?.email;
    const name = tokenPayload?.name;
    
    // 4. Set user state
    setUser({
      userId: currentUser.userId,
      username: currentUser.username,
      email: email || currentUser.username,
      name: name,
    });
  } catch (error) {
    // Silent fail - user chưa đăng nhập
    setUser(null);
  } finally {
    setIsLoading(false);
  }
};
```

**Lưu ý:**
- `UserUnauthenticatedException` là exception bình thường khi user chưa login
- Không show error cho exception này
- Lấy user attributes từ ID token thay vì gọi API riêng

#### 4.4. login() Function

**Mục đích:** Đăng nhập user với email và password

**Flow:**
1. Validate Cognito config
2. Gọi `signIn()` từ Amplify
3. Nếu thành công → Fetch user info và set state
4. Show toast success và redirect về home
5. Nếu thất bại → Show error toast

```typescript
const login = async (email: string, password: string) => {
  try {
    // 1. Validate config
    if (!userPoolId) {
      showToast("Cognito chưa được cấu hình", "error");
      throw new Error("Config missing");
    }

    setIsLoading(true);
    
    // 2. Sign in
    const { isSignedIn } = await signIn({
      username: email,  // Cognito dùng email làm username
      password,
    });

    // 3. Nếu thành công
    if (isSignedIn) {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();
      const tokenPayload = session.tokens?.idToken?.payload as any;
      
      // 4. Set user state với info từ token
      setUser({
        userId: currentUser.userId,
        email: tokenPayload?.email || email,
        username: currentUser.username,
        name: tokenPayload?.name,
      });
      
      showToast("Đăng nhập thành công!", "success");
      router.push("/");
    }
  } catch (error) {
    showToast(error.message, "error");
    throw error;
  } finally {
    setIsLoading(false);
  }
};
```

#### 4.5. logout() Function

**Mục đích:** Đăng xuất user

**Flow:**
1. Gọi `signOut()` từ Amplify
2. Clear user state
3. Show toast và redirect về login

```typescript
const logout = async () => {
  try {
    await signOut();
    setUser(null);
    showToast("Đã đăng xuất thành công", "success");
    router.push("/login");
  } catch (error) {
    showToast("Đăng xuất thất bại", "error");
    throw error;
  }
};
```

---

### Bước 5: Tích hợp vào Root Layout (`app/layout.tsx`)

**Mục đích:** Wrap toàn bộ app với auth providers

**Thứ tự providers (quan trọng):**

```typescript
<AmplifyProvider>      // 1. Configure Amplify trước
  <ToastProvider>      // 2. Toast để show notifications
    <AuthProvider>     // 3. Auth state management
      {children}       // 4. App components
    </AuthProvider>
  </ToastProvider>
</AmplifyProvider>
```

**Lý do thứ tự:**
- AmplifyProvider phải ở ngoài cùng để configure Amplify trước
- ToastProvider cần có sẵn để AuthProvider có thể dùng
- AuthProvider cần cả Amplify và Toast để hoạt động

---

### Bước 6: Tạo Login Page (`app/login/page.tsx`)

**Mục đích:** Form đăng nhập

**Chi tiết:**
- Form với email và password
- Sử dụng `useAuth()` hook để gọi `login()`
- Loading state khi đang submit
- Error handling với toast notifications
- Link đến signup page

**Key code:**
```typescript
const { login, isLoading } = useAuth();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    await login(email, password);
    // Redirect được handle trong login() function
  } catch (error) {
    // Error đã được handle trong login()
  }
};
```

---

### Bước 7: Tạo Signup Page (`app/signup/page.tsx`)

**Mục đích:** Form đăng ký với email confirmation

#### 7.1. Form Fields Configuration

```typescript
const formFields = {
  signUp: {
    name: {
      label: "Full Name",
      placeholder: "Nhập họ và tên của bạn",
      required: true,
      order: 1,
    },
    email: {
      label: "Email",
      placeholder: "your@email.com",
      required: true,
      order: 2,
    },
    password: {
      label: "Mật khẩu",
      placeholder: "Tối thiểu 8 ký tự",
      required: true,
      order: 3,
    },
  },
};
```

**Lý do:**
- Centralized configuration dễ maintain
- Có thể customize label, placeholder, order
- Type-safe với TypeScript

#### 7.2. Signup Flow

**Flow:**
1. User điền form (name, email, password, confirmPassword)
2. Validate: password match, length >= 8, name không rỗng
3. Gọi `signUp()` với user attributes
4. Nếu cần confirmation → Show confirmation form
5. User nhập code → Gọi `confirmSignUp()`
6. Redirect đến login page

**Key code:**
```typescript
const { isSignUpComplete, nextStep } = await signUp({
  username: email,
  password,
  options: {
    userAttributes: {
      email,
      name: name.trim(),  // Lưu Full Name
    },
  },
});

if (nextStep.signUpStep === "CONFIRM_SIGN_UP") {
  setNeedsConfirmation(true);
  // Show confirmation form
}
```

---

### Bước 8: Tạo User Menu (`components/layout/user-menu.tsx`)

**Mục đích:** Hiển thị user info và logout button

**Features:**
- Dropdown menu với user info
- Hiển thị name (nếu có) hoặc email
- Logout button
- Click outside để đóng menu
- Loading state khi check auth

**Key code:**
```typescript
const { user, logout } = useAuth();

// Hiển thị name hoặc email
{user.name || user.email || user.username || "User"}

// Dropdown menu với click outside handler
useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  }
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);
```

---

## 🔄 Authentication Flow

### Flow 1: App Load (Check Auth)

```
User mở app
    ↓
Root Layout render
    ↓
AmplifyProvider mount → configureAmplify()
    ↓
AuthProvider mount → useEffect() → checkAuth()
    ↓
getCurrentUser() từ Amplify
    ↓
┌─────────────────┐
│  Có user?       │
└─────────────────┘
    │
    ├─ YES → Fetch session → Get email/name → Set user state
    │
    └─ NO → Set user = null (silent)
    ↓
isLoading = false
    ↓
App render với auth state
```

### Flow 2: Login

```
User điền form → Submit
    ↓
login(email, password)
    ↓
Validate Cognito config
    ↓
signIn({ username: email, password })
    ↓
┌─────────────────┐
│  Thành công?    │
└─────────────────┘
    │
    ├─ YES → getCurrentUser() → fetchAuthSession()
    │       → Extract email/name từ token
    │       → Set user state
    │       → Show toast success
    │       → Redirect to "/"
    │
    └─ NO → Show error toast → Throw error
```

### Flow 3: Signup

```
User điền form → Submit
    ↓
Validate: password match, length, name
    ↓
signUp({ username: email, password, userAttributes: { email, name } })
    ↓
┌──────────────────────┐
│  Cần confirmation?   │
└──────────────────────┘
    │
    ├─ YES → Show confirmation form
    │       → User nhập code
    │       → confirmSignUp()
    │       → Redirect to login
    │
    └─ NO → Redirect to login (auto-confirmed)
```

### Flow 4: Logout

```
User click logout
    ↓
logout()
    ↓
signOut() từ Amplify
    ↓
Clear user state (setUser(null))
    ↓
Show toast success
    ↓
Redirect to "/login"
```

---

## 🎨 Customization Guide

### 1. Thêm User Attributes

**Bước 1:** Cập nhật User interface

```typescript
// lib/auth/auth-context.tsx
interface User {
  userId: string;
  email?: string;
  username?: string;
  name?: string;
  phone?: string;        // Thêm field mới
  address?: string;     // Thêm field mới
}
```

**Bước 2:** Cập nhật signup để gửi attribute

```typescript
// app/signup/page.tsx
await signUp({
  username: email,
  password,
  options: {
    userAttributes: {
      email,
      name: name.trim(),
      phone: phone,      // Thêm attribute mới
      address: address,   // Thêm attribute mới
    },
  },
});
```

**Bước 3:** Cập nhật checkAuth và login để lấy attribute

```typescript
// lib/auth/auth-context.tsx
const tokenPayload = session.tokens?.idToken?.payload as any;
const phone = tokenPayload?.phone_number;
const address = tokenPayload?.address;

setUser({
  // ... existing fields
  phone: phone,
  address: address,
});
```

**Bước 4:** Đảm bảo Cognito User Pool cho phép attribute này
- Vào AWS Console > Cognito > User Pool > Attributes
- Enable attribute trong "Standard attributes" hoặc "Custom attributes"

---

### 2. Thay đổi Login Method

**Hiện tại:** Login bằng email

**Muốn đổi sang:** Login bằng username hoặc phone

**Cách làm:**

```typescript
// lib/auth/config.ts
loginWith: {
  email: false,      // Tắt email
  username: true,    // Bật username
  phone: false,      // Hoặc bật phone
},
```

**Cập nhật login form:**
- Thay đổi input type và validation
- Cập nhật label và placeholder

---

### 3. Thêm Protected Routes

**Hiện tại:** Tất cả routes đều public

**Muốn:** Protect một số routes (ví dụ: `/booking-success`)

**Cách 1: Client-side Protection**

```typescript
// app/booking-success/page.tsx
"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BookingSuccessPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return null;

  return <div>Protected content</div>;
}
```

**Cách 2: Middleware Protection (Server-side)**

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check auth token từ cookie hoặc header
  const token = request.cookies.get("auth-token");
  
  if (!token && request.nextUrl.pathname.startsWith("/booking-success")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  return NextResponse.next();
}
```

---

### 4. Customize Form Fields

**Thêm field mới vào signup:**

```typescript
// app/signup/page.tsx
const formFields = {
  signUp: {
    name: { /* ... */ },
    email: { /* ... */ },
    phone: {                    // Thêm field mới
      label: "Số điện thoại",
      placeholder: "0123456789",
      required: false,
      order: 2.5,               // Giữa email và password
    },
    password: { /* ... */ },
  },
};
```

**Thêm state và input:**

```typescript
const [phone, setPhone] = useState("");

// Trong form
<div>
  <label>{formFields.signUp.phone.label}</label>
  <input
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    placeholder={formFields.signUp.phone.placeholder}
  />
</div>
```

---

### 5. Thay đổi Redirect sau Login/Logout

**Sau login:**

```typescript
// lib/auth/auth-context.tsx
const login = async (email: string, password: string) => {
  // ... login logic
  if (isSignedIn) {
    // Thay đổi redirect
    router.push("/dashboard");  // Thay vì "/"
  }
};
```

**Sau logout:**

```typescript
const logout = async () => {
  await signOut();
  setUser(null);
  router.push("/");  // Thay vì "/login"
};
```

---

## 🐛 Troubleshooting

### Lỗi: "Auth UserPool not configured"

**Nguyên nhân:** Environment variables chưa được set

**Giải pháp:**
1. Tạo file `.env.local` trong `frontend/`
2. Thêm các biến:
   ```env
   NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-southeast-1_xxxxx
   NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=xxxxx
   NEXT_PUBLIC_AWS_REGION=ap-southeast-1
   ```
3. **Restart dev server** (bắt buộc)

---

### Lỗi: "Invalid client" hoặc "User pool not found"

**Nguyên nhân:** User Pool ID hoặc Client ID sai

**Giải pháp:**
1. Kiểm tra lại User Pool ID format: `{region}_{random}`
2. Kiểm tra Client ID không có dấu gạch ngang
3. Đảm bảo region khớp với region của User Pool

---

### User không hiển thị sau login

**Nguyên nhân:** Token không có attribute hoặc checkAuth() chưa chạy

**Giải pháp:**
1. Kiểm tra browser console có lỗi không
2. Kiểm tra ID token có chứa attribute không:
   ```typescript
   const session = await fetchAuthSession();
   console.log(session.tokens?.idToken?.payload);
   ```
3. Đảm bảo attribute được set khi signup

---

### Lỗi: "UserUnauthenticatedException" khi checkAuth

**Đây không phải lỗi!** Đây là exception bình thường khi user chưa đăng nhập.

**Code đã handle:**
```typescript
catch (error: any) {
  if (error?.name !== "UserUnauthenticatedException") {
    console.warn("Auth check failed:", error?.message);
  }
  setUser(null);  // Silent fail
}
```

---

### Signup thành công nhưng không nhận được email confirmation

**Nguyên nhân:** Cognito chưa được config email hoặc email trong spam

**Giải pháp:**
1. Kiểm tra spam folder
2. Vào AWS Console > Cognito > User Pool > Messaging
3. Cấu hình email (có thể dùng SES hoặc default)
4. Kiểm tra User Pool settings > Policies > Allow users to sign themselves up

---

### Logout không redirect

**Nguyên nhân:** Router chưa được import hoặc có lỗi

**Giải pháp:**
1. Kiểm tra `useRouter` đã import từ `next/navigation`
2. Kiểm tra có lỗi trong console
3. Thử thêm delay:
   ```typescript
   await signOut();
   setUser(null);
   setTimeout(() => router.push("/login"), 100);
   ```

---

## 📚 Tài liệu tham khảo

- [AWS Amplify Auth Documentation](https://docs.amplify.aws/react/build-a-backend/auth/)
- [AWS Cognito User Pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

## ✅ Checklist khi customize

- [ ] Đã cập nhật User interface nếu thêm attributes
- [ ] Đã cập nhật signup để gửi attributes mới
- [ ] Đã cập nhật checkAuth và login để lấy attributes
- [ ] Đã enable attributes trong Cognito User Pool
- [ ] Đã test flow đầy đủ: signup → confirm → login → logout
- [ ] Đã kiểm tra browser console không có lỗi
- [ ] Đã test trên production environment (nếu có)

---

**Last Updated:** 2024
**Maintained by:** Development Team

