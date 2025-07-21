# ---- Base Node ----
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat
EXPOSE 3000

# ---- Dependencies ----
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production
RUN cp -R node_modules prod_node_modules
RUN npm ci

# ---- Build ----
FROM base AS builder
WORKDIR /app

# Build arguments
ARG NEXT_PUBLIC_AUTH_SERVICE_URL
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_BOTS_CONNECTION_SECRET
ARG NEXT_PUBLIC_MAIN_SERVICE_API_KEY
ARG NEXT_PUBLIC_STATS_SERVICE_SECRET_KEY

# Set environment variables for build
ENV NEXT_PUBLIC_AUTH_SERVICE_URL=$NEXT_PUBLIC_AUTH_SERVICE_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BOTS_CONNECTION_SECRET=$NEXT_PUBLIC_BOTS_CONNECTION_SECRET
ENV NEXT_PUBLIC_MAIN_SERVICE_API_KEY=$NEXT_PUBLIC_MAIN_SERVICE_API_KEY
ENV NEXT_PUBLIC_STATS_SERVICE_SECRET_KEY=$NEXT_PUBLIC_STATS_SERVICE_SECRET_KEY

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# ---- Production ----
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user to run the app
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); });"

CMD ["node", "server.js"]