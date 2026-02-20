import { z } from "zod"

// ─────────────────────────────────────────────
// Schemas de Compras
// ─────────────────────────────────────────────

export const purchaseItemSchema = z.object({
  productId: z.string().min(1, "Produto é obrigatório"),
  quantity: z.number({ error: "Quantidade é obrigatória" }).positive("Quantidade deve ser maior que zero"),
  unitPrice: z.number({ error: "Preço é obrigatório" }).positive("Preço deve ser maior que zero"),
})

export const createPurchaseSchema = z.object({
  buyerId: z.string().min(1, "Comprador é obrigatório"),
  supplier: z.string().optional(),
  date: z.coerce.date(),
  projectId: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(purchaseItemSchema).min(1, "Adicione pelo menos um item"),
})

export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>
export type PurchaseItemInput = z.infer<typeof purchaseItemSchema>
