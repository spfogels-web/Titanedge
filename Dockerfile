# ── Stage 1: build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Railway Runtime V2 passes user-defined service variables as Docker build
# args but does NOT inject them at container runtime. Declare them here so
# they are available during `next build` AND baked into the final image.
ARG TRADERSPOST_WEBHOOK_URL
ARG WEBHOOK_SECRET
ARG FINNHUB_API_KEY
ENV TRADERSPOST_WEBHOOK_URL=${TRADERSPOST_WEBHOOK_URL}
ENV WEBHOOK_SECRET=${WEBHOOK_SECRET}
ENV FINNHUB_API_KEY=${FINNHUB_API_KEY}

RUN npm run build

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Carry the user-defined vars forward from the build stage so they are
# present in process.env at runtime (Railway Runtime V2 workaround).
ARG TRADERSPOST_WEBHOOK_URL
ARG WEBHOOK_SECRET
ARG FINNHUB_API_KEY
ENV TRADERSPOST_WEBHOOK_URL=${TRADERSPOST_WEBHOOK_URL}
ENV WEBHOOK_SECRET=${WEBHOOK_SECRET}
ENV FINNHUB_API_KEY=${FINNHUB_API_KEY}

# Copy the standalone Next.js output and static assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
