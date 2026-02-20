import { z } from "zod"
import { AlertPriority } from "@prisma/client"

// ─────────────────────────────────────────────
// Criar alerta
// ─────────────────────────────────────────────

export const createAlertSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  priority: z.nativeEnum(AlertPriority).default(AlertPriority.MEDIUM),
  projectId: z.string().optional(),
  productId: z.string().optional(),
  assignedToId: z.string().optional(),
})

export type CreateAlertInput = z.infer<typeof createAlertSchema>

// ─────────────────────────────────────────────
// Atualizar alerta
// ─────────────────────────────────────────────

export const updateAlertSchema = createAlertSchema.partial().extend({
  id: z.string().min(1, "ID é obrigatório"),
})

export type UpdateAlertInput = z.infer<typeof updateAlertSchema>

// ─────────────────────────────────────────────
// Resolver alerta
// ─────────────────────────────────────────────

export const resolveAlertSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  notes: z.string().optional(),
})

export type ResolveAlertInput = z.infer<typeof resolveAlertSchema>
