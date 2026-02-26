"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth-action"
import { PERMISSIONS } from "@/domains/auth/permissions"
import { createAuditLog } from "@/lib/audit"
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
  const guard = await requirePermission(PERMISSIONS.financial.manage)
  if (!guard.user) return guard.error

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
        createdById: guard.user.id,
      },
    })

    void createAuditLog({ userId: guard.user.id, action: "CREATE", entity: "CashFlowEntry", entityId: entry.id }).catch(console.error)
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
  const guard = await requirePermission(PERMISSIONS.financial.manage)
  if (!guard.user) return guard.error

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

    void createAuditLog({ userId: guard.user.id, action: "MARK_PAID", entity: "CashFlowEntry", entityId: parsed.data.id }).catch(console.error)
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
  const guard = await requirePermission(PERMISSIONS.financial.manage)
  if (!guard.user) return guard.error

  const parsed = updateDueDateSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" }
  }

  try {
    await prisma.cashFlowEntry.update({
      where: { id: parsed.data.id },
      data: { dueDate: parsed.data.dueDate },
    })

    void createAuditLog({ userId: guard.user.id, action: "UPDATE_DUE_DATE", entity: "CashFlowEntry", entityId: parsed.data.id }).catch(console.error)
    revalidatePath("/financeiro")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao atualizar vencimento" }
  }
}
