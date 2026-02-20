// ─────────────────────────────────────────────
// REGRA DE OURO: Todos os cálculos financeiros de orçamentos ficam aqui.
// Nunca chame estas funções diretamente na UI — sempre via import do domain.
// ─────────────────────────────────────────────

import { QuoteStatus } from "@prisma/client"
import type { QuoteItemInput, QuoteServiceInput, QuoteTotals } from "./types"

const FEE_RATE = 0.15
const OVERDUE_DAYS = 30

export function calculateQuoteTotals(
  items: QuoteItemInput[],
  services: QuoteServiceInput[],
  applyFee: boolean,
): QuoteTotals {
  const subtotalItems = items.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice,
    0,
  )

  const subtotalServices = services.reduce(
    (acc, svc) => acc + svc.quantity * svc.unitPrice,
    0,
  )

  const subtotal = subtotalItems + subtotalServices
  const fee = applyFee ? subtotal * FEE_RATE : 0
  const total = subtotal + fee

  return {
    subtotalItems,
    subtotalServices,
    subtotal,
    fee,
    total,
  }
}

export function isQuoteOverdue(createdAt: Date, status: QuoteStatus): boolean {
  if (status !== QuoteStatus.PENDING) return false

  const now = new Date()
  const diffMs = now.getTime() - createdAt.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  return diffDays > OVERDUE_DAYS
}
