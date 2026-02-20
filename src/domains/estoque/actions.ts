"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import type { ActionResult } from "@/types"
import { StockEntryType } from "@prisma/client"
import {
  createStockEntrySchema,
  createStockExitSchema,
  createToolLoanSchema,
  returnToolSchema,
  type CreateStockEntryInput,
  type CreateStockExitInput,
  type CreateToolLoanInput,
  type ReturnToolInput,
} from "./schemas"

// ─────────────────────────────────────────────
// Registrar Entrada Manual de Estoque
// ─────────────────────────────────────────────

export async function createStockEntryAction(
  data: CreateStockEntryInput
): Promise<ActionResult<{ id: string }>> {
  const session = await auth()
  if (!session?.user) return { success: false, error: "Não autenticado" }

  const parsed = createStockEntrySchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos: " + parsed.error.issues[0].message }
  }

  const { productId, quantity, notes } = parsed.data

  try {
    const entry = await prisma.stockEntry.create({
      data: {
        productId,
        quantity,
        type: StockEntryType.MANUAL,
        notes: notes ?? null,
        registeredById: session.user.id,
      },
    })

    revalidatePath("/estoque")
    return { success: true, data: { id: entry.id } }
  } catch {
    return { success: false, error: "Erro ao registrar entrada de estoque" }
  }
}

// ─────────────────────────────────────────────
// Registrar Saída de Estoque
// ─────────────────────────────────────────────

export async function createStockExitAction(
  data: CreateStockExitInput
): Promise<ActionResult<{ id: string }>> {
  const session = await auth()
  if (!session?.user) return { success: false, error: "Não autenticado" }

  const parsed = createStockExitSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos: " + parsed.error.issues[0].message }
  }

  const { productId, quantity, projectId, notes } = parsed.data

  try {
    const exit = await prisma.stockExit.create({
      data: {
        productId,
        quantity,
        projectId: projectId || null,
        notes: notes ?? null,
        registeredById: session.user.id,
      },
    })

    revalidatePath("/estoque")
    if (projectId) revalidatePath(`/projetos/${projectId}`)
    return { success: true, data: { id: exit.id } }
  } catch {
    return { success: false, error: "Erro ao registrar saída de estoque" }
  }
}

// ─────────────────────────────────────────────
// Registrar Empréstimo de Ferramenta
// ─────────────────────────────────────────────

export async function createToolLoanAction(
  data: CreateToolLoanInput
): Promise<ActionResult<{ id: string }>> {
  const session = await auth()
  if (!session?.user) return { success: false, error: "Não autenticado" }

  const parsed = createToolLoanSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos: " + parsed.error.issues[0].message }
  }

  const { productId, quantity, employeeId, projectId, notes } = parsed.data

  try {
    const loan = await prisma.toolLoan.create({
      data: {
        productId,
        quantity,
        employeeId,
        projectId: projectId || null,
        notes: notes ?? null,
        registeredById: session.user.id,
      },
    })

    revalidatePath("/estoque")
    return { success: true, data: { id: loan.id } }
  } catch {
    return { success: false, error: "Erro ao registrar empréstimo" }
  }
}

// ─────────────────────────────────────────────
// Devolução de Ferramenta
// ─────────────────────────────────────────────

export async function returnToolAction(
  data: ReturnToolInput
): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user) return { success: false, error: "Não autenticado" }

  const parsed = returnToolSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos: " + parsed.error.issues[0].message }
  }

  const { toolLoanId } = parsed.data

  try {
    const loan = await prisma.toolLoan.findFirst({
      where: { id: toolLoanId, returnedAt: null },
    })

    if (!loan) return { success: false, error: "Empréstimo não encontrado ou já devolvido" }

    await prisma.toolLoan.update({
      where: { id: toolLoanId },
      data: { returnedAt: new Date() },
    })

    // Criar entrada de devolução no estoque
    await prisma.stockEntry.create({
      data: {
        productId: loan.productId,
        quantity: loan.quantity,
        type: StockEntryType.RETURN,
        notes: `Devolução de empréstimo #${toolLoanId.slice(-8)}`,
        registeredById: session.user.id,
      },
    })

    revalidatePath("/estoque")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao registrar devolução" }
  }
}
