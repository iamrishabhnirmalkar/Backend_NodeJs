# ===========================================
# Production Dockerfile - Multi-stage Build
# Optimized for production deployment
# ===========================================

# ===========================================
# Stage 1: Base (Build Stage)
# ===========================================
FROM node:20-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Copy Prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN pnpm prisma:init

# Copy source code
COPY . .

# Build TypeScript to JavaScript
RUN pnpm build

# ===========================================
# Stage 2: Production (Runtime Stage)
# ===========================================
FROM node:20-alpine AS production

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
# Skip scripts to avoid husky prepare script (husky is dev dependency, not needed in production)
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# Install Prisma CLI globally (needed for migrations in production)
# Prisma is in devDependencies but we need CLI for migrations
RUN npm install -g prisma@^6.19.0

# Copy Prisma schema (needed for migrations and client generation)
COPY prisma ./prisma

# Generate Prisma client (output: node_modules/.prisma/client)
RUN npx prisma generate

# Copy built application from base stage
COPY --from=base /app/dist ./dist

# Create logs directory
RUN mkdir -p /app/logs

# Set non-root user for security (optional but recommended)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 8000

# Health check: Docker calls this every 30s to see if the app is up (hits /api/v1/health)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/server.js"]
