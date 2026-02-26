"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth-action"
import { PERMISSIONS } from "@/domains/auth/permissions"
import { createAuditLog } from "@/lib/audit"
import type { ActionResult } from "@/types"
import {
  createAlertSchema,
  updateAlertSchema,
  resolveAlertSchema,
  type CreateAlertInput,
  type UpdateAlertInput,
  type ResolveAlertInput,
} from "./schemas"

// ─────────────────────────────────────────────
// createAlertAction
// ─────────────────────────────────────────────

export async function createAlertAction(
  data: CreateAlertInput
): Promise<ActionResult<{ id: string }>> {
  const guard = await requirePermission(PERMISSIONS.operacao.create)
  if (!guard.user) return guard.error

  const parsed = createAlertSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" }
  }

  try {
    const alert = await prisma.alert.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        priority: parsed.data.priority,
        projectId: parsed.data.projectId || null,
        productId: parsed.data.productId || null,
        assignedToId: parsed.data.assignedToId || null,
        createdById: guard.user.id,
      },
    })

    void createAuditLog({ userId: guard.user.id, action: "CREATE", entity: "Alert", entityId: alert.id }).catch(console.error)
    revalidatePath("/operacao")
    return { success: true, data: { id: alert.id } }
  } catch {
    return { success: false, error: "Erro ao criar alerta" }
  }
}

// ─────────────────────────────────────────────
// updateAlertAction
// ─────────────────────────────────────────────

export async function updateAlertAction(
  data: UpdateAlertInput
): Promise<ActionResult> {
  const guard = await requirePermission(PERMISSIONS.operacao.manage)
  if (!guard.user) return guard.error

  const parsed = updateAlertSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" }
  }

  const { id, ...fields } = parsed.data

  try {
    await prisma.alert.update({
      where: { id },
      data: {
        ...(fields.title !== undefined && { title: fields.title }),
        ...(fields.description !== undefined && {
          description: fields.description || null,
        }),
        ...(fields.priority !== undefined && { priority: fields.priority }),
        ...(fields.projectId !== undefined && {
          projectId: fields.projectId || null,
        }),
        ...(fields.productId !== undefined && {
          productId: fields.productId || null,
        }),
        ...(fields.assignedToId !== undefined && {
          assignedToId: fields.assignedToId || null,
        }),
      },
    })

    void createAuditLog({ userId: guard.user.id, action: "UPDATE", entity: "Alert", entityId: id }).catch(console.error)
    revalidatePath("/operacao")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao atualizar alerta" }
  }
}

// ─────────────────────────────────────────────
// resolveAlertAction
// ─────────────────────────────────────────────

export async function resolveAlertAction(
  data: ResolveAlertInput
): Promise<ActionResult> {
  const guard = await requirePermission(PERMISSIONS.operacao.manage)
  if (!guard.user) return guard.error

  const parsed = resolveAlertSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" }
  }

  try {
    await prisma.alert.update({
      where: { id: parsed.data.id },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
      },
    })

    void createAuditLog({ userId: guard.user.id, action: "RESOLVE", entity: "Alert", entityId: parsed.data.id }).catch(console.error)
    revalidatePath("/operacao")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao resolver alerta" }
  }
}

// ─────────────────────────────────────────────
// deleteAlertAction
// ─────────────────────────────────────────────

export async function deleteAlertAction(id: string): Promise<ActionResult> {
  const guard = await requirePermission(PERMISSIONS.operacao.manage)
  if (!guard.user) return guard.error

  try {
    await prisma.alert.delete({
      where: { id },
    })

    void createAuditLog({ userId: guard.user.id, action: "DELETE", entity: "Alert", entityId: id }).catch(console.error)
    revalidatePath("/operacao")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao excluir alerta" }
  }
}
