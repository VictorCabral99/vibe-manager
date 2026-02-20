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

# DATABASE_URL placeholder só para satisfazer a inicialização do módulo Prisma
# durante o build. Nenhuma conexão real é feita (páginas são force-dynamic).
# O valor real é injetado pelo Render em runtime via variável de ambiente.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"

# Build do Next.js (standalone)
RUN npm run build

# ─────────────────────────────────────────────
# Stage 3 — Runner
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

# node_modules completo do builder — necessário para a CLI do Prisma (migrate deploy)
# que puxa @prisma/dev, valibot, hono e outras dezenas de deps transitivas.
# O standalone sobrescreve node_modules com o mínimo; este COPY garante que
# tudo que a CLI precisa está disponível.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Schema e config do Prisma para o migrate deploy
COPY --from=builder --chown=nextjs:nodejs /app/prisma          ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts

# Entrypoint (migrations + start)
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
