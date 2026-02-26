"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth-action"
import { PERMISSIONS } from "@/domains/auth/permissions"
import { createAuditLog } from "@/lib/audit"
import type { ActionResult } from "@/types"
import {
  createProductSchema,
  updateProductSchema,
  type CreateProductInput,
  type UpdateProductInput,
} from "./schemas"

export async function createProductAction(
  data: CreateProductInput
): Promise<ActionResult<{ id: string }>> {
  const guard = await requirePermission(PERMISSIONS.catalog.create)
  if (!guard.user) return guard.error

  const parsed = createProductSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" }
  }

  try {
    const product = await prisma.product.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        category: parsed.data.category,
        unit: parsed.data.unit,
        type: parsed.data.type,
        minimumStock: parsed.data.minimumStock,
        isActive: parsed.data.isActive,
      },
    })
    void createAuditLog({ userId: guard.user.id, action: "CREATE", entity: "Product", entityId: product.id }).catch(console.error)
    revalidatePath("/catalogo/produtos")
    return { success: true, data: { id: product.id } }
  } catch {
    return { success: false, error: "Erro ao criar produto" }
  }
}

export async function updateProductAction(
  data: UpdateProductInput
): Promise<ActionResult> {
  const guard = await requirePermission(PERMISSIONS.catalog.edit)
  if (!guard.user) return guard.error

  const parsed = updateProductSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" }
  }

  const { id, ...fields } = parsed.data

  try {
    await prisma.product.update({
      where: { id },
      data: {
        ...(fields.name !== undefined && { name: fields.name }),
        ...(fields.description !== undefined && {
          description: fields.description || null,
        }),
        ...(fields.category !== undefined && { category: fields.category }),
        ...(fields.unit !== undefined && { unit: fields.unit }),
        ...(fields.type !== undefined && { type: fields.type }),
        ...(fields.minimumStock !== undefined && {
          minimumStock: fields.minimumStock,
        }),
        ...(fields.isActive !== undefined && { isActive: fields.isActive }),
      },
    })
    void createAuditLog({ userId: guard.user.id, action: "UPDATE", entity: "Product", entityId: id }).catch(console.error)
    revalidatePath("/catalogo/produtos")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao atualizar produto" }
  }
}

export async function toggleProductActiveAction(
  id: string
): Promise<ActionResult> {
  const guard = await requirePermission(PERMISSIONS.catalog.edit)
  if (!guard.user) return guard.error

  try {
    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      select: { isActive: true },
    })

    if (!product) {
      return { success: false, error: "Produto não encontrado" }
    }

    await prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
    })

    void createAuditLog({ userId: guard.user.id, action: "TOGGLE_ACTIVE", entity: "Product", entityId: id }).catch(console.error)
    revalidatePath("/catalogo/produtos")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao alterar status do produto" }
  }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const guard = await requirePermission(PERMISSIONS.catalog.delete)
  if (!guard.user) return guard.error

  try {
    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    void createAuditLog({ userId: guard.user.id, action: "DELETE", entity: "Product", entityId: id }).catch(console.error)
    revalidatePath("/catalogo/produtos")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao excluir produto" }
  }
}
