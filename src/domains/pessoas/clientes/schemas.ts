import { z } from "zod"

export const createClientSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  document: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

export const updateClientSchema = createClientSchema.partial().extend({
  id: z.string().min(1, "ID é obrigatório"),
})

export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
