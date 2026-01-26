# ============================================
# Stage 1: Dependencies (Pruning)
# ============================================
FROM node:20-alpine AS deps

WORKDIR /app

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# Sometimes needed for specific libraries, but for standard Express/AWS SDK it's optional.
# RUN apk add --no-cache libc6-compat

COPY package.json yarn.lock ./

# TỐI ƯU HÓA: Chỉ cài dependencies cần thiết cho Production
# Giúp giảm dung lượng Image từ ~500MB xuống còn ~100MB
RUN yarn install --production --frozen-lockfile

# ============================================
# Stage 2: Runner
# ============================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Security: Don't run as root
# 'node' user exists by default in alpine image with uid 1000
# We don't need to create it again

# Copy package files (Good practice for debugging version)
COPY package.json yarn.lock ./

# Copy ONLY production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
# Quan trọng: Set quyền sở hữu file cho user 'node' ngay lập tức
COPY --chown=node:node src ./src
# Nếu bạn có các file config khác ở root (vd: .env.example), hãy copy cụ thể, tránh copy rác
# COPY --chown=node:node .env.example ./

# Switch user to non-root
USER node

# Expose port
EXPOSE 5000

# Health Check (Chuẩn cho AWS ALB & ECS)
# ALB sẽ ping vào đây, nếu fail nó sẽ restart container
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/v1/health || exit 1

# Start Server
# Entry point is src/index.js (not src/server.js)
CMD ["node", "src/index.js"]