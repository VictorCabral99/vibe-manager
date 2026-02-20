# ─────────────────────────────────────────────
# Stage 1 — Instalar dependências
# ─────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

ENV NO_UPDATE_NOTIFIER=1

COPY package.json package-lock.json ./
RUN npm ci

# ─────────────────────────────────────────────
# Stage 2 — Build
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Gera o Prisma Client
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1

# Build do Next.js (standalone)
RUN npm run build

# ─────────────────────────────────────────────
# Stage 3 — Runner (imagem mínima)
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Assets públicos
COPY --from=builder /app/public ./public

# Servidor standalone gerado pelo Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma CLI + client (necessário para migrate deploy no entrypoint)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.bin/prisma     ./node_modules/.bin/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma          ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma         ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma         ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma                       ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts             ./prisma.config.ts

# dotenv (usado pelo prisma.config.ts)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/dotenv          ./node_modules/dotenv
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/dotenv-expand   ./node_modules/dotenv-expand

# Entrypoint (migrations + start)
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
