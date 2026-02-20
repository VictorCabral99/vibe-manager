import { z } from "zod"

export const createServiceSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  basePrice: z
    .number({ error: "Valor base deve ser um número" })
    .min(0, "Valor base não pode ser negativo")
    .optional(),
  isActive: z.boolean(),
})

export const updateServiceSchema = createServiceSchema.partial().extend({
  id: z.string().min(1, "ID é obrigatório"),
})

export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>
