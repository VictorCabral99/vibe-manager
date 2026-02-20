"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import type { ActionResult } from "@/types"
import { createPurchaseSchema, type CreatePurchaseInput } from "./schemas"
import {
  StockEntryType,
  ExpenseType,
  CashFlowType,
  CashFlowDirection,
} from "@prisma/client"

// ─────────────────────────────────────────────
// Criar Compra
// ─────────────────────────────────────────────

export async function createPurchaseAction(
  data: CreatePurchaseInput
): Promise<ActionResult<{ id: string }>> {
  const session = await auth()
  if (!session?.user) return { success: false, error: "Não autenticado" }

  const parsed = createPurchaseSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos: " + parsed.error.issues[0].message }
  }

  const { buyerId, supplier, date, projectId, notes, items } = parsed.data

  try {
    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

    const purchase = await prisma.$transaction(async (tx) => {
      // 1. Criar a compra com items
      const newPurchase = await tx.purchase.create({
        data: {
          buyerId,
          supplier: supplier ?? null,
          date,
          projectId: projectId || null,
          totalAmount,
          notes: notes ?? null,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
            })),
          },
        },
        include: {
          items: true,
        },
      })

      // 2. Para cada item: criar StockEntry (tipo PURCHASE)
      for (const item of newPurchase.items) {
        await tx.stockEntry.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            type: StockEntryType.PURCHASE,
            purchaseItemId: item.id,
            registeredById: session.user.id,
          },
        })
      }

      // 3. Se vinculado a projeto: criar ProjectExpense (tipo MATERIAL)
      if (projectId) {
        await tx.projectExpense.create({
          data: {
            projectId,
            type: ExpenseType.MATERIAL,
            description: `Compra de materiais${supplier ? ` - ${supplier}` : ""}`,
            amount: totalAmount,
            date,
            registeredById: session.user.id,
            purchaseId: newPurchase.id,
          },
        })
      }

      // 4. Criar CashFlowEntry (PURCHASE_PAYABLE / OUT)
      await tx.cashFlowEntry.create({
        data: {
          type: CashFlowType.PURCHASE_PAYABLE,
          direction: CashFlowDirection.OUT,
          description: `Compra${supplier ? ` - ${supplier}` : ""}`,
          amount: totalAmount,
          dueDate: date,
          purchaseId: newPurchase.id,
          createdById: session.user.id,
        },
      })

      return newPurchase
    })

    revalidatePath("/compras")
    if (projectId) {
      revalidatePath(`/projetos/${projectId}`)
    }
    return { success: true, data: { id: purchase.id } }
  } catch {
    return { success: false, error: "Erro ao registrar compra" }
  }
}

// ─────────────────────────────────────────────
// Deletar Compra
// ─────────────────────────────────────────────

export async function deletePurchaseAction(id: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user) return { success: false, error: "Não autenticado" }

  try {
    // Verificar se há dependências que impeçam a exclusão
    const purchase = await prisma.purchase.findFirst({
      where: { id },
      include: {
        _count: { select: { items: true } },
      },
    })

    if (!purchase) return { success: false, error: "Compra não encontrada" }

    // Hard delete em cascata (purchase_items tem onDelete: Cascade)
    await prisma.$transaction(async (tx) => {
      // Remover stock entries relacionadas
      await tx.stockEntry.deleteMany({
        where: {
          purchaseItem: { purchaseId: id },
        },
      })

      // Remover project expenses relacionadas
      await tx.projectExpense.deleteMany({
        where: { purchaseId: id },
      })

      // Remover cash flow entries relacionadas
      await tx.cashFlowEntry.deleteMany({
        where: { purchaseId: id },
      })

      // Remover a compra (itens em cascata)
      await tx.purchase.delete({ where: { id } })
    })

    revalidatePath("/compras")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao excluir compra" }
  }
}
