# Multi-stage build for production
FROM node:18-slim AS builder

WORKDIR /app

# Install OpenSSL and other dependencies needed for Prisma
RUN apt-get update && apt-get install -y openssl libssl-dev ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL dependencies (including dev dependencies needed for build)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:18-slim AS runner

WORKDIR /app

# Install OpenSSL for Prisma and curl for healthcheck
RUN apt-get update && apt-get install -y openssl ca-certificates curl && rm -rf /var/lib/apt/lists/*

# Create non-root user (Debian syntax)
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bcrypt ./node_modules/bcrypt
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Copy entrypoint script
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Create uploads directory
RUN mkdir -p /data/uploads && chown -R nextjs:nodejs /data

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV NODE_ENV production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/healthz || exit 1

# Start the application with entrypoint script
CMD ["./docker-entrypoint.sh"]
