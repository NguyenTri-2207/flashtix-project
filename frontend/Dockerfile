# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
# 'npm ci' is faster and more reliable for CI/CD pipelines than 'npm install'
RUN npm ci

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ⚠️ QUAN TRỌNG: Xử lý biến môi trường Next.js (Build-time Variables)
# Next.js "hardcode" các biến NEXT_PUBLIC_ vào file HTML/JS ngay lúc chạy lệnh build.
# Vì vậy, bạn PHẢI truyền đúng giá trị này khi chạy lệnh 'docker build'.

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_AWS_REGION
ARG NEXT_PUBLIC_COGNITO_USER_POOL_ID
ARG NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_AWS_REGION=${NEXT_PUBLIC_AWS_REGION}
ENV NEXT_PUBLIC_COGNITO_USER_POOL_ID=${NEXT_PUBLIC_COGNITO_USER_POOL_ID}
ENV NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=${NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID}

# Set ENV for build process
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js with standalone output
RUN npm run build

# ============================================
# Stage 3: Runner
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Security: Run as non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy essential files only (Optimization)
COPY --from=builder /app/public ./public

# Tự động set quyền cho user nextjs khi copy
# Copy folder standalone (đã bao gồm server và các file js cần thiết)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Copy static assets (css, images, fonts)
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# ⚠️ QUAN TRỌNG: Networking
# Mặc định Next.js nghe ở 127.0.0.1 (localhost).
# Trên Docker/ECS, phải set 0.0.0.0 để container nhận được traffic từ bên ngoài.
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

CMD ["node", "server.js"]