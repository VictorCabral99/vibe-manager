// ─────────────────────────────────────────────
// Tipos do domínio Orçamentos
// ─────────────────────────────────────────────

export interface QuoteItemInput {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

export interface QuoteServiceInput {
  serviceId: string
  serviceName: string
  quantity: number
  unitPrice: number
  description?: string
}

export interface QuoteTotals {
  subtotalItems: number
  subtotalServices: number
  subtotal: number
  fee: number // 15% se applyFee
  total: number
}
