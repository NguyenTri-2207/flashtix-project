# 🎨 Đặc tả Frontend & Hướng dẫn Cấu trúc Dự án (Frontend Specifications)

Tài liệu này dùng để hướng dẫn AI (Cursor) tạo cấu trúc dự án và code giao diện cho dự án **FlashTix**.

## 1. Tổng quan Công nghệ (Tech Stack)
* **Framework:** Next.js 14+ (Sử dụng **App Router** bắt buộc).
* **Ngôn ngữ:** TypeScript.
* **Styling:** TailwindCSS (Sử dụng utility classes, hạn chế custom CSS).
* **Icons:** Lucide React hoặc Heroicons.
* **State Management:** React Context (cho giỏ hàng đơn giản) hoặc Zustand.
* **Mục tiêu UX:** Phản hồi cực nhanh (Extreme responsiveness). Giao diện phải xử lý tốt các trạng thái Loading (Skeleton) và lỗi API (Error Boundary) khi giả lập lượng truy cập cao.

## 2. Cấu trúc Thư mục Yêu cầu (Project Structure)

```text
frontend
├── app/
│   ├── layout.tsx           # Root Layout (Fonts, Global Providers)
│   ├── page.tsx             # Home Page
│   ├── events/
│   │   └── [id]/
│   │       └── page.tsx     # Event Detail Page
│   ├── booking-success/
│   │   └── page.tsx         # Success Page
│   └── globals.css
├── components/
│   ├── ui/                  # Các component nhỏ (Button, Badge, Card, Toast...)
│   ├── layout/              # Header, Footer
│   └── features/            # Các component nghiệp vụ (EventCard, BookingForm...)
├── lib/
│   ├── utils.ts             # CN function for Tailwind merge
│   └── mockData.ts          # Dữ liệu giả lập (Events list)
└── types/
    └── index.ts             # Định nghĩa Type (Event, Booking)

## 3. Sitemap & Yêu cầu Chi tiết từng trang

### 3.1. Trang chủ (`/`)

**Mục đích:** Trang Landing page hiển thị danh sách sự kiện đang mở bán.

**Thành phần giao diện:**

- **Hero Section:** 
  - Banner lớn với gradient background (red → pink → purple)
  - Tiêu đề hấp dẫn: "Săn vé Flash Sale"
  - Badge "Flash Sale - Giới hạn thời gian"
  - CTA button "Xem sự kiện ngay" với icon Zap

- **Event List:** 
  - Grid layout responsive (1 cột mobile, 2 cột tablet, 3 cột desktop)
  - Chia 2 section: "Đang mở bán" và "Sắp diễn ra"
  - Mỗi Event Card hiển thị:
    - Hình ảnh thumbnail (với hover effect scale)
    - Status Badge góc trên phải
    - Tên sự kiện (2 dòng, truncate)
    - Icon + Ngày tổ chức (format: thứ, ngày tháng năm)
    - Icon + Giờ tổ chức
    - Icon + Địa điểm (1 dòng, truncate)
    - Giá vé (màu đỏ, font bold)
    - Số vé còn lại (nếu đang mở bán)

**Status Badge:**
- "Sắp diễn ra" (Upcoming) - Màu xanh dương
- "Đang mở bán" (On Sale) - Gradient xanh lá (nổi bật)
- "Hết vé" (Sold Out) - Màu xám đậm

**Components sử dụng:**
- `EventCard` - Component hiển thị thẻ sự kiện
- `Badge` - Component badge trạng thái
- `Card` - Component card container

---

### 3.2. Trang Chi tiết Sự kiện (`/events/[id]`)

**Mục đích:** Đây là trang quan trọng nhất, nơi chịu tải cao nhất (Traffic Spike). Người dùng sẽ chờ ở đây để bấm nút mua.

**Layout:**
- 2 cột trên desktop (Image bên trái, Content bên phải)
- 1 cột trên mobile (Image trên, Content dưới)
- Breadcrumb "Quay lại" ở đầu trang

**Tính năng chính:**

1. **Skeleton Loading:**
   - Hiển thị khi đang fetch dữ liệu
   - Skeleton cho image, title, và các sections
   - Tăng perceived performance

2. **Live Stock Counter:**
   - Component hiển thị số vé còn lại
   - Progress bar thể hiện % còn lại
   - Màu sắc thay đổi theo mức độ (xanh > vàng > đỏ)
   - Icon Ticket với gradient background

3. **Countdown Timer:**
   - Hiển thị khi sự kiện chưa mở bán
   - Format: `HH:MM:SS`
   - Tự động chuyển sang state "active" khi hết thời gian
   - Icon Clock

4. **Action Button (BookingButton):**
   - Xử lý 4 trạng thái:
     - **State Wait:** "Mở bán trong 00:05:00" (Disabled, hiển thị countdown)
     - **State Active:** "MUA VÉ NGAY" (Gradient đỏ-hồng, nổi bật, click được)
     - **State Processing:** Icon xoay + "Đang xử lý..." (Disabled, tránh spam click)
     - **State Sold Out:** "HẾT VÉ" (Outline, disabled, màu xám)

5. **Error Handling:**
   - Retry logic tự động (3 lần, mỗi lần cách 3s)
   - Toast notification khi server bận
   - Fallback UI khi không tải được dữ liệu
   - Không để white screen of death

**Thông tin hiển thị:**
- Hình ảnh sự kiện (full width, rounded)
- Tên sự kiện (font lớn, bold)
- Ngày tổ chức (format đầy đủ: "Thứ X, ngày DD tháng MM năm YYYY")
- Giờ tổ chức
- Địa điểm
- Giá vé (font lớn, màu đỏ)
- Mô tả sự kiện

**Components sử dụng:**
- `LiveStockCounter` - Bộ đếm vé real-time
- `CountdownTimer` - Đồng hồ đếm ngược
- `BookingButton` - Nút đặt vé với 4 states
- `Skeleton` - Loading placeholder
- `Card` - Container cho các sections
- `Toast` - Thông báo lỗi/retry

---

### 3.3. Trang Đặt vé thành công (`/booking-success`)

**Mục đích:** Xác nhận giao dịch thành công.

**Layout:**
- Center-aligned card
- Background gradient (green → emerald)
- Card với border và shadow nổi bật

**Nội dung:**

1. **Success Icon:**
   - Icon CheckCircle2 trong circle gradient (green)
   - Kích thước lớn, nổi bật

2. **Thông báo thành công:**
   - Tiêu đề: "Chúc mừng!" (font lớn, bold)
   - Mô tả: "Bạn đã săn vé thành công"

3. **Mã đặt chỗ:**
   - Card riêng với background xám nhạt
   - Icon Ticket
   - Booking Reference (format: `BK{timestamp}`)
   - Tên sự kiện (nếu có)

4. **Lưu ý:**
   - Card với border
   - List các lưu ý quan trọng:
     - Lưu lại mã đặt chỗ
     - Vé sẽ gửi qua email trong 24h
     - Liên hệ hotline nếu cần

5. **Action Button:**
   - Button "Quay về trang chủ" với icon Home
   - Full width trên mobile, auto width trên desktop

**URL Parameters:**
- `?ref={bookingReference}` - Mã đặt chỗ
- `?eventId={eventId}` - ID sự kiện (optional)

**Components sử dụng:**
- `Button` - CTA button
- `Card` - Container chính

4. Xử lý Lỗi & Hiệu năng (Quan trọng cho Demo High Traffic)
Vì đây là dự án giả lập hệ thống bị quá tải (Crash simulation), Frontend phải xử lý các lỗi API một cách mượt mà:

Kịch bản: Khi API trả về lỗi 500 hoặc 503 (Server Busy).

Phản hồi giao diện:

KHÔNG được để trang web bị trắng (White screen of death).

Hiển thị Toast Notification (Thông báo nhỏ góc màn hình): "Server đang bận, hệ thống sẽ tự thử lại trong 3s...".

Thực hiện cơ chế Client-side Retry (Tự động gọi lại API sau vài giây).