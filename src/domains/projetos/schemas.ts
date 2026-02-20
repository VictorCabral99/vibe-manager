import { z } from "zod"
import { ExpenseType } from "@prisma/client"

// ─────────────────────────────────────────────
// Projeto
// ─────────────────────────────────────────────

export const createProjectSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  clientId: z.string().min(1, "Cliente é obrigatório"),
  totalRevenue: z.number({ error: "Receita é obrigatória" }).positive("Receita deve ser maior que zero"),
  targetMargin: z.number().min(0).max(1),
  notes: z.string().optional(),
})

export const updateProjectSchema = createProjectSchema.partial().extend({
  id: z.string().min(1, "ID é obrigatório"),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>

// ─────────────────────────────────────────────
// Despesa
// ─────────────────────────────────────────────

export const createExpenseSchema = z.object({
  projectId: z.string().min(1, "Projeto é obrigatório"),
  type: z.nativeEnum(ExpenseType),
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.number({ error: "Valor é obrigatório" }).positive("Valor deve ser maior que zero"),
  date: z.coerce.date(),
})

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>

// ─────────────────────────────────────────────
// Profissional de Mão de Obra
// ─────────────────────────────────────────────

export const createLaborProfessionalSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().optional(),
  dailyRate: z.number({ error: "Diária é obrigatória" }).positive("Diária deve ser maior que zero"),
})

export const updateLaborProfessionalSchema = createLaborProfessionalSchema.partial().extend({
  id: z.string().min(1, "ID é obrigatório"),
})

export type CreateLaborProfessionalInput = z.infer<typeof createLaborProfessionalSchema>
export type UpdateLaborProfessionalInput = z.infer<typeof updateLaborProfessionalSchema>

// ─────────────────────────────────────────────
// Lançamento de Mão de Obra
// ─────────────────────────────────────────────

export const createLaborEntrySchema = z.object({
  professionalId: z.string().min(1, "Profissional é obrigatório"),
  projectId: z.string().min(1, "Projeto é obrigatório"),
  date: z.coerce.date(),
  quantity: z.number().positive("Quantidade deve ser maior que zero"),
  description: z.string().optional(),
})

export type CreateLaborEntryInput = z.infer<typeof createLaborEntrySchema>
