import { z } from "zod"

// ─────────────────────────────────────────────
// Schemas de Estoque
// ─────────────────────────────────────────────

export const createStockEntrySchema = z.object({
  productId: z.string().min(1, "Produto é obrigatório"),
  quantity: z.number({ error: "Quantidade é obrigatória" }).positive("Quantidade deve ser maior que zero"),
  notes: z.string().optional(),
})

export const createStockExitSchema = z.object({
  productId: z.string().min(1, "Produto é obrigatório"),
  quantity: z.number({ error: "Quantidade é obrigatória" }).positive("Quantidade deve ser maior que zero"),
  projectId: z.string().optional(),
  notes: z.string().optional(),
})

export const createToolLoanSchema = z.object({
  productId: z.string().min(1, "Ferramenta é obrigatória"),
  quantity: z.number({ error: "Quantidade é obrigatória" }).positive("Quantidade deve ser maior que zero"),
  employeeId: z.string().min(1, "Funcionário é obrigatório"),
  projectId: z.string().optional(),
  notes: z.string().optional(),
})

export const returnToolSchema = z.object({
  toolLoanId: z.string().min(1, "ID do empréstimo é obrigatório"),
})

export type CreateStockEntryInput = z.infer<typeof createStockEntrySchema>
export type CreateStockExitInput = z.infer<typeof createStockExitSchema>
export type CreateToolLoanInput = z.infer<typeof createToolLoanSchema>
export type ReturnToolInput = z.infer<typeof returnToolSchema>
