"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth-action"
import { PERMISSIONS } from "@/domains/auth/permissions"
import { createAuditLog } from "@/lib/audit"
import type { ActionResult } from "@/types"
import {
  createUserSchema,
  updateUserSchema,
  changePasswordSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type ChangePasswordInput,
} from "./schemas"

// ─────────────────────────────────────────────
// Actions de Usuários
// ─────────────────────────────────────────────

export async function createUserAction(
  data: CreateUserInput
): Promise<ActionResult<{ id: string }>> {
  const guard = await requirePermission(PERMISSIONS.users.create)
  if (!guard.user) return guard.error

  const parsed = createUserSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  try {
    const { email, password, name, role, isActive } = parsed.data

    const existing = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    })
    if (existing) {
      return { success: false, error: "E-mail já cadastrado" }
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        isActive,
      },
    })

    void createAuditLog({ userId: guard.user.id, action: "CREATE", entity: "User", entityId: user.id }).catch(console.error)
    revalidatePath("/pessoas/usuarios")
    return { success: true, data: { id: user.id } }
  } catch {
    return { success: false, error: "Erro ao criar usuário" }
  }
}

export async function updateUserAction(data: UpdateUserInput): Promise<ActionResult> {
  const guard = await requirePermission(PERMISSIONS.users.edit)
  if (!guard.user) return guard.error

  const parsed = updateUserSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  try {
    const { id, password, ...rest } = parsed.data

    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    })
    if (!user) {
      return { success: false, error: "Usuário não encontrado" }
    }

    if (rest.email && rest.email !== user.email) {
      const existing = await prisma.user.findFirst({
        where: { email: rest.email, deletedAt: null, NOT: { id } },
      })
      if (existing) {
        return { success: false, error: "E-mail já cadastrado" }
      }
    }

    const updateData: Record<string, unknown> = { ...rest }
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    await prisma.user.update({
      where: { id },
      data: updateData,
    })

    void createAuditLog({ userId: guard.user.id, action: "UPDATE", entity: "User", entityId: id }).catch(console.error)
    revalidatePath("/pessoas/usuarios")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao atualizar usuário" }
  }
}

export async function toggleUserActiveAction(id: string): Promise<ActionResult> {
  const guard = await requirePermission(PERMISSIONS.users.edit)
  if (!guard.user) return guard.error

  try {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, isActive: true },
    })
    if (!user) {
      return { success: false, error: "Usuário não encontrado" }
    }

    await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    })

    void createAuditLog({ userId: guard.user.id, action: "TOGGLE_ACTIVE", entity: "User", entityId: id }).catch(console.error)
    revalidatePath("/pessoas/usuarios")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao alterar status do usuário" }
  }
}

export async function changePasswordAction(data: ChangePasswordInput): Promise<ActionResult> {
  const guard = await requirePermission(PERMISSIONS.users.edit)
  if (!guard.user) return guard.error

  const parsed = changePasswordSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  try {
    const { id, newPassword } = parsed.data

    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    })
    if (!user) {
      return { success: false, error: "Usuário não encontrado" }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    })

    void createAuditLog({ userId: guard.user.id, action: "CHANGE_PASSWORD", entity: "User", entityId: id }).catch(console.error)
    revalidatePath("/pessoas/usuarios")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao alterar senha" }
  }
}

export async function deleteUserAction(id: string): Promise<ActionResult> {
  const guard = await requirePermission(PERMISSIONS.users.delete)
  if (!guard.user) return guard.error

  try {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    })
    if (!user) {
      return { success: false, error: "Usuário não encontrado" }
    }

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    void createAuditLog({ userId: guard.user.id, action: "DELETE", entity: "User", entityId: id }).catch(console.error)
    revalidatePath("/pessoas/usuarios")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao excluir usuário" }
  }
}
