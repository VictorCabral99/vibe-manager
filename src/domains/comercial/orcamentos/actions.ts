"use server"

import { revalidatePath } from "next/cache"
import { QuoteStatus, CashFlowType, CashFlowDirection } from "@prisma/client"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { ActionResult } from "@/types"
import { calculateQuoteTotals } from "./calculations"
import {
  createQuoteSchema,
  updateQuoteSchema,
  changeQuoteStatusSchema,
  type CreateQuoteInput,
  type UpdateQuoteInput,
  type ChangeQuoteStatusInput,
} from "./schemas"

const QUOTES_PATH = "/comercial/orcamentos"

// ─────────────────────────────────────────────
// Helpers internos
// ─────────────────────────────────────────────

async function getAuthenticatedUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

// ─────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────

export async function createQuoteAction(
  data: CreateQuoteInput,
): Promise<ActionResult<{ id: string }>> {
  const userId = await getAuthenticatedUserId()
  if (!userId) return { success: false, error: "Não autenticado" }

  const parsed = createQuoteSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const { clientId, applyFee, notes, items, services } = parsed.data

  // Mapeia para QuoteItemInput / QuoteServiceInput sem os campos de display
  const itemInputs = items.map((i) => ({
    productId: i.productId,
    productName: "",
    quantity: i.quantity,
    unitPrice: i.unitPrice,
  }))
  const serviceInputs = services.map((s) => ({
    serviceId: s.serviceId,
    serviceName: "",
    quantity: s.quantity,
    unitPrice: s.unitPrice,
    description: s.description,
  }))

  const totals = calculateQuoteTotals(itemInputs, serviceInputs, applyFee)

  try {
    const quote = await prisma.$transaction(async (tx) => {
      const created = await tx.quote.create({
        data: {
          clientId,
          applyFee,
          notes,
          createdById: userId,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity.toFixed(3),
              unitPrice: item.unitPrice.toFixed(2),
              total: (item.quantity * item.unitPrice).toFixed(2),
            })),
          },
          services: {
            create: services.map((svc) => ({
              serviceId: svc.serviceId,
              quantity: svc.quantity.toFixed(3),
              unitPrice: svc.unitPrice.toFixed(2),
              total: (svc.quantity * svc.unitPrice).toFixed(2),
              description: svc.description,
            })),
          },
          statusLogs: {
            create: {
              toStatus: QuoteStatus.PENDING,
              changedById: userId,
              notes: "Orçamento criado",
            },
          },
        },
      })

      return created
    })

    revalidatePath(QUOTES_PATH)
    return { success: true, data: { id: quote.id } }
  } catch (error) {
    console.error("[createQuoteAction]", error)
    return { success: false, error: "Erro ao criar orçamento" }
  }
}

export async function updateQuoteAction(
  data: UpdateQuoteInput,
): Promise<ActionResult<{ id: string }>> {
  const userId = await getAuthenticatedUserId()
  if (!userId) return { success: false, error: "Não autenticado" }

  const parsed = updateQuoteSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const { id, clientId, applyFee, notes, items, services } = parsed.data

  // Verifica se o orçamento existe e está em PENDING
  const existing = await prisma.quote.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, status: true },
  })

  if (!existing) return { success: false, error: "Orçamento não encontrado" }
  if (existing.status !== QuoteStatus.PENDING) {
    return { success: false, error: "Apenas orçamentos pendentes podem ser editados" }
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Deleta itens e serviços antigos
      await tx.quoteItem.deleteMany({ where: { quoteId: id } })
      await tx.quoteService.deleteMany({ where: { quoteId: id } })

      await tx.quote.update({
        where: { id },
        data: {
          ...(clientId ? { clientId } : {}),
          ...(applyFee !== undefined ? { applyFee } : {}),
          ...(notes !== undefined ? { notes } : {}),
          ...(items
            ? {
                items: {
                  create: items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity.toFixed(3),
                    unitPrice: item.unitPrice.toFixed(2),
                    total: (item.quantity * item.unitPrice).toFixed(2),
                  })),
                },
              }
            : {}),
          ...(services
            ? {
                services: {
                  create: services.map((svc) => ({
                    serviceId: svc.serviceId,
                    quantity: svc.quantity.toFixed(3),
                    unitPrice: svc.unitPrice.toFixed(2),
                    total: (svc.quantity * svc.unitPrice).toFixed(2),
                    description: svc.description,
                  })),
                },
              }
            : {}),
        },
      })
    })

    revalidatePath(QUOTES_PATH)
    revalidatePath(`${QUOTES_PATH}/${id}`)
    return { success: true, data: { id } }
  } catch (error) {
    console.error("[updateQuoteAction]", error)
    return { success: false, error: "Erro ao atualizar orçamento" }
  }
}

export async function changeQuoteStatusAction(
  data: ChangeQuoteStatusInput,
): Promise<ActionResult> {
  const userId = await getAuthenticatedUserId()
  if (!userId) return { success: false, error: "Não autenticado" }

  const parsed = changeQuoteStatusSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  const { quoteId, newStatus, notes } = parsed.data

  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, deletedAt: null },
    include: {
      items: true,
      services: true,
    },
  })

  if (!quote) return { success: false, error: "Orçamento não encontrado" }

  try {
    await prisma.$transaction(async (tx) => {
      // Atualiza o status
      await tx.quote.update({
        where: { id: quoteId },
        data: { status: newStatus },
      })

      // Cria log de status
      await tx.quoteStatusLog.create({
        data: {
          quoteId,
          fromStatus: quote.status,
          toStatus: newStatus,
          changedById: userId,
          notes,
        },
      })

      // Se virou PAID, cria entrada no fluxo de caixa
      if (newStatus === QuoteStatus.PAID) {
        const itemInputs = quote.items.map((i) => ({
          productId: i.productId,
          productName: "",
          quantity: i.quantity.toNumber(),
          unitPrice: i.unitPrice.toNumber(),
        }))
        const serviceInputs = quote.services.map((s) => ({
          serviceId: s.serviceId,
          serviceName: "",
          quantity: s.quantity.toNumber(),
          unitPrice: s.unitPrice.toNumber(),
          description: s.description ?? undefined,
        }))

        const totals = calculateQuoteTotals(itemInputs, serviceInputs, quote.applyFee)

        await tx.cashFlowEntry.create({
          data: {
            type: CashFlowType.QUOTE_RECEIVABLE,
            direction: CashFlowDirection.IN,
            description: `Recebimento do orçamento #${quoteId.slice(-8).toUpperCase()}`,
            amount: totals.total.toFixed(2),
            dueDate: new Date(),
            quoteId,
            createdById: userId,
          },
        })
      }
    })

    revalidatePath(QUOTES_PATH)
    revalidatePath(`${QUOTES_PATH}/${quoteId}`)
    return { success: true }
  } catch (error) {
    console.error("[changeQuoteStatusAction]", error)
    return { success: false, error: "Erro ao alterar status do orçamento" }
  }
}

export async function deleteQuoteAction(id: string): Promise<ActionResult> {
  const userId = await getAuthenticatedUserId()
  if (!userId) return { success: false, error: "Não autenticado" }

  const quote = await prisma.quote.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, status: true },
  })

  if (!quote) return { success: false, error: "Orçamento não encontrado" }

  if (
    quote.status !== QuoteStatus.PENDING &&
    quote.status !== QuoteStatus.CANCELLED
  ) {
    return {
      success: false,
      error: "Apenas orçamentos pendentes ou cancelados podem ser excluídos",
    }
  }

  try {
    await prisma.quote.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    revalidatePath(QUOTES_PATH)
    return { success: true }
  } catch (error) {
    console.error("[deleteQuoteAction]", error)
    return { success: false, error: "Erro ao excluir orçamento" }
  }
}

export async function convertQuoteToProjectAction(
  quoteId: string,
  projectName: string,
): Promise<ActionResult<{ projectId: string }>> {
  const userId = await getAuthenticatedUserId()
  if (!userId) return { success: false, error: "Não autenticado" }

  if (!projectName.trim()) {
    return { success: false, error: "Nome do projeto é obrigatório" }
  }

  const quote = await prisma.quote.findFirst({
    where: { id: quoteId, deletedAt: null },
    include: {
      items: true,
      services: true,
      project: { select: { id: true } },
    },
  })

  if (!quote) return { success: false, error: "Orçamento não encontrado" }
  if (quote.status !== QuoteStatus.PAID) {
    return { success: false, error: "Apenas orçamentos pagos podem ser convertidos em projeto" }
  }
  if (quote.project) {
    return { success: false, error: "Este orçamento já foi convertido em projeto" }
  }

  const itemInputs = quote.items.map((i) => ({
    productId: i.productId,
    productName: "",
    quantity: i.quantity.toNumber(),
    unitPrice: i.unitPrice.toNumber(),
  }))
  const serviceInputs = quote.services.map((s) => ({
    serviceId: s.serviceId,
    serviceName: "",
    quantity: s.quantity.toNumber(),
    unitPrice: s.unitPrice.toNumber(),
    description: s.description ?? undefined,
  }))

  const totals = calculateQuoteTotals(itemInputs, serviceInputs, quote.applyFee)

  try {
    const project = await prisma.project.create({
      data: {
        name: projectName.trim(),
        clientId: quote.clientId,
        quoteId,
        totalRevenue: totals.total.toFixed(2),
        createdById: userId,
      },
    })

    revalidatePath(QUOTES_PATH)
    revalidatePath(`${QUOTES_PATH}/${quoteId}`)
    return { success: true, data: { projectId: project.id } }
  } catch (error) {
    console.error("[convertQuoteToProjectAction]", error)
    return { success: false, error: "Erro ao converter orçamento em projeto" }
  }
}
