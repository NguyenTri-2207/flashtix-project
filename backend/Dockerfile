# ============================================
# Stage 1: Dependencies (Cài đặt thư viện)
# ============================================
FROM node:20-alpine AS deps

WORKDIR /app

# Cài đặt libc6-compat nếu dùng thư viện xử lý ảnh hoặc native modules (Optional nhưng nên có)
RUN apk add --no-cache libc6-compat

# Copy file định nghĩa thư viện trước để tận dụng Docker Cache
COPY package.json yarn.lock ./

# Chỉ cài dependencies cho Production (Bỏ qua devDependencies)
# Giúp giảm dung lượng image đáng kể
RUN yarn install --production --frozen-lockfile

# ============================================
# Stage 2: Runner (Môi trường chạy thật)
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# Thiết lập môi trường Production
ENV NODE_ENV=production

# 💡 PRO TIP: Cài đặt "dumb-init"
# Node.js mặc định không xử lý tốt tín hiệu "SIGTERM" từ AWS ECS khi tắt task.
# dumb-init giúp container tắt nhẹ nhàng (Graceful Shutdown), không bị lỗi zombie process.
RUN apk add --no-cache dumb-init wget

# Tạo user/group (Thực ra node:20-alpine đã có sẵn user 'node', dòng này để đảm bảo UID/GID chuẩn)
# Nhưng để đơn giản ta dùng user 'node' có sẵn.

# Copy node_modules từ Stage 1 sang
# Quan trọng: Phải set quyền sở hữu (--chown) cho user 'node' ngay lúc copy
COPY --from=deps --chown=node:node /app/node_modules ./node_modules

# Copy source code backend
COPY --chown=node:node src ./src
COPY --chown=node:node package.json ./

# Chuyển sang user thường (Non-root) để bảo mật
USER node

# Mở cổng 5000
EXPOSE 5000

# 🏥 Health Check (Cực quan trọng cho ALB)
# ALB sẽ ping vào đây. Nếu thất bại 3 lần, nó sẽ tự kill container và tạo cái mới.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/v1/health || exit 1

# Khởi chạy server thông qua dumb-init
CMD ["dumb-init", "node", "src/index.js"]