"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
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
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" }
  }

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
        createdById: session.user.id,
      },
    })

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
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" }
  }

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
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" }
  }

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
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" }
  }

  try {
    await prisma.alert.delete({
      where: { id },
    })

    revalidatePath("/operacao")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao excluir alerta" }
  }
}
