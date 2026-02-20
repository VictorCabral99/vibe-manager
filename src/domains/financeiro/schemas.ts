import { z } from "zod"

// ─────────────────────────────────────────────
// Criar conta externa a pagar
// ─────────────────────────────────────────────

export const createExternalPayableSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z
    .number({ error: "Valor é obrigatório" })
    .positive("Valor deve ser maior que zero"),
  dueDate: z.coerce.date(),
  notes: z.string().optional(),
})

export type CreateExternalPayableInput = z.infer<
  typeof createExternalPayableSchema
>

// ─────────────────────────────────────────────
// Marcar como pago
// ─────────────────────────────────────────────

export const markAsPaidSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  paidAt: z.coerce.date().optional(),
})

export type MarkAsPaidInput = z.infer<typeof markAsPaidSchema>

// ─────────────────────────────────────────────
// Atualizar vencimento
// ─────────────────────────────────────────────

export const updateDueDateSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  dueDate: z.coerce.date(),
})

export type UpdateDueDateInput = z.infer<typeof updateDueDateSchema>
