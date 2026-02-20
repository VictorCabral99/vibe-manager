import { z } from "zod"

// ─────────────────────────────────────────────
// Schemas de Funcionários
// ─────────────────────────────────────────────

export const createEmployeeSchema = z.object({
  userId: z.string().cuid("ID de usuário inválido"),
  name: z.string().min(1, "Nome é obrigatório"),
  cpf: z
    .string()
    .regex(/^\d{11}$/, "CPF deve conter 11 dígitos numéricos")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  jobTitle: z.string().min(1, "Cargo é obrigatório"),
  canPurchase: z.boolean(),
  canWithdrawStock: z.boolean(),
  notes: z.string().optional().or(z.literal("")),
})

export const updateEmployeeSchema = z.object({
  id: z.string().cuid("ID inválido"),
  userId: z.string().cuid("ID de usuário inválido").optional(),
  name: z.string().min(1, "Nome é obrigatório").optional(),
  cpf: z
    .string()
    .regex(/^\d{11}$/, "CPF deve conter 11 dígitos numéricos")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  jobTitle: z.string().min(1, "Cargo é obrigatório").optional(),
  canPurchase: z.boolean().optional(),
  canWithdrawStock: z.boolean().optional(),
  notes: z.string().optional().or(z.literal("")),
})

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>
