# ── Stage 1: build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build without baking secrets — Next.js API routes read process.env at
# runtime, so we only need NEXT_PUBLIC_ vars at build time.
RUN npm run build

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy the standalone Next.js output and static assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# All other env vars (TRADERSPOST_WEBHOOK_URL, WEBHOOK_SECRET, DATABASE_URL,
# etc.) are injected by Railway at container start — never baked into the image.
CMD ["node", "server.js"]
