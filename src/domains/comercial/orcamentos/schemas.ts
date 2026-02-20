import { z } from "zod"
import { QuoteStatus } from "@prisma/client"

// ─────────────────────────────────────────────
// Sub-schemas internos
// ─────────────────────────────────────────────

const quoteItemSchema = z.object({
  productId: z.string().min(1, "Produto é obrigatório"),
  quantity: z.number().positive("Quantidade deve ser positiva"),
  unitPrice: z.number().min(0, "Preço unitário não pode ser negativo"),
})

const quoteServiceSchema = z.object({
  serviceId: z.string().min(1, "Serviço é obrigatório"),
  quantity: z.number().positive("Quantidade deve ser positiva").default(1),
  unitPrice: z.number().min(0, "Preço unitário não pode ser negativo"),
  description: z.string().optional(),
})

// ─────────────────────────────────────────────
// Schemas públicos
// ─────────────────────────────────────────────

// Base sem refine — permite usar .partial() em updateQuoteSchema (Zod v4)
const quoteBaseSchema = z.object({
  clientId: z.string().min(1, "Cliente é obrigatório"),
  applyFee: z.boolean(),
  notes: z.string().optional(),
  items: z.array(quoteItemSchema).min(0),
  services: z.array(quoteServiceSchema).min(0),
})

export const createQuoteSchema = quoteBaseSchema.refine(
  (d) => d.items.length > 0 || d.services.length > 0,
  {
    message: "Orçamento deve ter ao menos 1 item ou serviço",
    path: ["items"],
  }
)

export const updateQuoteSchema = quoteBaseSchema
  .partial()
  .extend({ id: z.string().min(1, "ID é obrigatório") })
  .refine(
    (d) =>
      d.items === undefined ||
      d.services === undefined ||
      d.items.length > 0 ||
      d.services.length > 0,
    {
      message: "Orçamento deve ter ao menos 1 item ou serviço",
      path: ["items"],
    }
  )

export const changeQuoteStatusSchema = z.object({
  quoteId: z.string().min(1, "ID do orçamento é obrigatório"),
  newStatus: z.nativeEnum(QuoteStatus, { message: "Status inválido" }),
  notes: z.string().optional(),
})

// ─────────────────────────────────────────────
// Tipos inferidos
// ─────────────────────────────────────────────

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>
export type ChangeQuoteStatusInput = z.infer<typeof changeQuoteStatusSchema>
