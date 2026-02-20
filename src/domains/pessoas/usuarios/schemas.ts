import { z } from "zod"
import { Role } from "@prisma/client"

// ─────────────────────────────────────────────
// Schemas de Usuários
// ─────────────────────────────────────────────

export const createUserSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  name: z.string().min(1, "Nome é obrigatório"),
  role: z.nativeEnum(Role, { message: "Perfil inválido" }),
  isActive: z.boolean(),
})

export const updateUserSchema = z.object({
  id: z.string().cuid("ID inválido"),
  email: z.string().email("E-mail inválido").optional(),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres").optional(),
  name: z.string().min(1, "Nome é obrigatório").optional(),
  role: z.nativeEnum(Role, { message: "Perfil inválido" }).optional(),
  isActive: z.boolean().optional(),
})

export const changePasswordSchema = z
  .object({
    id: z.string().cuid("ID inválido"),
    newPassword: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  })

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
