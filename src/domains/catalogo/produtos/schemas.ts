import { z } from "zod"
import { MeasurementUnit, ProductType } from "@prisma/client"

export const createProductSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  category: z.string().min(1, "Categoria é obrigatória"),
  unit: z.nativeEnum(MeasurementUnit, {
    error: "Unidade inválida",
  }),
  type: z.nativeEnum(ProductType, {
    error: "Tipo inválido",
  }),
  minimumStock: z
    .number({ error: "Estoque mínimo deve ser um número" })
    .int("Estoque mínimo deve ser um número inteiro")
    .min(0, "Estoque mínimo não pode ser negativo"),
  isActive: z.boolean(),
})

export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().min(1, "ID é obrigatório"),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
