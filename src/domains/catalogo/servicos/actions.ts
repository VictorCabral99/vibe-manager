"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth-action"
import { PERMISSIONS } from "@/domains/auth/permissions"
import { createAuditLog } from "@/lib/audit"
import type { ActionResult } from "@/types"
import {
  createServiceSchema,
  updateServiceSchema,
  type CreateServiceInput,
  type UpdateServiceInput,
} from "./schemas"

export async function createServiceAction(
  data: CreateServiceInput
): Promise<ActionResult<{ id: string }>> {
  const guard = await requirePermission(PERMISSIONS.catalog.create)
  if (!guard.user) return guard.error

  const parsed = createServiceSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" }
  }

  try {
    const service = await prisma.service.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        basePrice: parsed.data.basePrice ?? null,
        isActive: parsed.data.isActive,
      },
    })
    void createAuditLog({ userId: guard.user.id, action: "CREATE", entity: "Service", entityId: service.id }).catch(console.error)
    revalidatePath("/catalogo/servicos")
    return { success: true, data: { id: service.id } }
  } catch {
    return { success: false, error: "Erro ao criar serviço" }
  }
}

export async function updateServiceAction(
  data: UpdateServiceInput
): Promise<ActionResult> {
  const guard = await requirePermission(PERMISSIONS.catalog.edit)
  if (!guard.user) return guard.error

  const parsed = updateServiceSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" }
  }

  const { id, ...fields } = parsed.data

  try {
    await prisma.service.update({
      where: { id },
      data: {
        ...(fields.name !== undefined && { name: fields.name }),
        ...(fields.description !== undefined && {
          description: fields.description || null,
        }),
        ...(fields.basePrice !== undefined && { basePrice: fields.basePrice ?? null }),
        ...(fields.isActive !== undefined && { isActive: fields.isActive }),
      },
    })
    void createAuditLog({ userId: guard.user.id, action: "UPDATE", entity: "Service", entityId: id }).catch(console.error)
    revalidatePath("/catalogo/servicos")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao atualizar serviço" }
  }
}

export async function toggleServiceActiveAction(
  id: string
): Promise<ActionResult> {
  const guard = await requirePermission(PERMISSIONS.catalog.edit)
  if (!guard.user) return guard.error

  try {
    const service = await prisma.service.findFirst({
      where: { id, deletedAt: null },
      select: { isActive: true },
    })

    if (!service) {
      return { success: false, error: "Serviço não encontrado" }
    }

    await prisma.service.update({
      where: { id },
      data: { isActive: !service.isActive },
    })

    void createAuditLog({ userId: guard.user.id, action: "TOGGLE_ACTIVE", entity: "Service", entityId: id }).catch(console.error)
    revalidatePath("/catalogo/servicos")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao alterar status do serviço" }
  }
}

export async function deleteServiceAction(id: string): Promise<ActionResult> {
  const guard = await requirePermission(PERMISSIONS.catalog.delete)
  if (!guard.user) return guard.error

  try {
    await prisma.service.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    void createAuditLog({ userId: guard.user.id, action: "DELETE", entity: "Service", entityId: id }).catch(console.error)
    revalidatePath("/catalogo/servicos")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao excluir serviço" }
  }
}
