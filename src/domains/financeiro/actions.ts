"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { ActionResult } from "@/types"
import {
  createExternalPayableSchema,
  markAsPaidSchema,
  updateDueDateSchema,
  type CreateExternalPayableInput,
  type MarkAsPaidInput,
  type UpdateDueDateInput,
} from "./schemas"

// ─────────────────────────────────────────────
// createExternalPayableAction
// ─────────────────────────────────────────────

export async function createExternalPayableAction(
  data: CreateExternalPayableInput
): Promise<ActionResult<{ id: string }>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" }
  }

  const parsed = createExternalPayableSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" }
  }

  try {
    const entry = await prisma.cashFlowEntry.create({
      data: {
        type: "EXTERNAL_PAYABLE",
        direction: "OUT",
        description: parsed.data.description,
        amount: parsed.data.amount,
        dueDate: parsed.data.dueDate,
        status: "PENDING",
        createdById: session.user.id,
      },
    })

    revalidatePath("/financeiro")
    return { success: true, data: { id: entry.id } }
  } catch {
    return { success: false, error: "Erro ao criar conta a pagar" }
  }
}

// ─────────────────────────────────────────────
// markAsPaidAction
// ─────────────────────────────────────────────

export async function markAsPaidAction(
  data: MarkAsPaidInput
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" }
  }

  const parsed = markAsPaidSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" }
  }

  try {
    await prisma.cashFlowEntry.update({
      where: { id: parsed.data.id },
      data: {
        status: "PAID",
        paidAt: parsed.data.paidAt ?? new Date(),
      },
    })

    revalidatePath("/financeiro")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao marcar como pago" }
  }
}

// ─────────────────────────────────────────────
// updateDueDateAction
// ─────────────────────────────────────────────

export async function updateDueDateAction(
  data: UpdateDueDateInput
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Não autenticado" }
  }

  const parsed = updateDueDateSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" }
  }

  try {
    await prisma.cashFlowEntry.update({
      where: { id: parsed.data.id },
      data: { dueDate: parsed.data.dueDate },
    })

    revalidatePath("/financeiro")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao atualizar vencimento" }
  }
}
