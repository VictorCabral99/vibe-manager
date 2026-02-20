import { QuoteStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"

// ─────────────────────────────────────────────
// Tipos de retorno
// ─────────────────────────────────────────────

export type QuoteListItem = Awaited<ReturnType<typeof findAllQuotes>>[number]
export type QuoteDetail = Awaited<ReturnType<typeof findQuoteById>>

// ─────────────────────────────────────────────
// Queries de Orçamentos
// ─────────────────────────────────────────────

export async function findAllQuotes(filters?: {
  status?: QuoteStatus
  clientId?: string
}) {
  return prisma.quote.findMany({
    where: {
      deletedAt: null,
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.clientId ? { clientId: filters.clientId } : {}),
    },
    select: {
      id: true,
      status: true,
      applyFee: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      client: {
        select: {
          id: true,
          name: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          items: true,
          services: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function findQuoteById(id: string) {
  return prisma.quote.findFirst({
    where: { id, deletedAt: null },
    include: {
      client: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              unit: true,
              category: true,
            },
          },
        },
      },
      services: {
        include: {
          service: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      },
      statusLogs: {
        include: {
          changedBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      project: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
      cashFlowEntry: {
        select: {
          id: true,
          amount: true,
          status: true,
          dueDate: true,
        },
      },
    },
  })
}

export async function findPendingQuotesOlderThan30Days() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  return prisma.quote.findMany({
    where: {
      deletedAt: null,
      status: QuoteStatus.PENDING,
      createdAt: { lt: thirtyDaysAgo },
    },
    include: {
      client: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "asc" },
  })
}

export async function findOverdueClients() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const quotes = await prisma.quote.findMany({
    where: {
      deletedAt: null,
      status: QuoteStatus.APPROVED,
      createdAt: { lt: thirtyDaysAgo },
    },
    select: {
      id: true,
      createdAt: true,
      client: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  // Deduplica por cliente
  const clientMap = new Map<string, (typeof quotes)[number]["client"]>()
  for (const quote of quotes) {
    if (!clientMap.has(quote.client.id)) {
      clientMap.set(quote.client.id, quote.client)
    }
  }

  return Array.from(clientMap.values())
}

// ─────────────────────────────────────────────
// Queries auxiliares para formulários
// ─────────────────────────────────────────────

export async function findActiveClients() {
  return prisma.client.findMany({
    where: { deletedAt: null, isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
}

export async function findActiveProducts() {
  return prisma.product.findMany({
    where: { deletedAt: null, isActive: true },
    select: { id: true, name: true, unit: true, category: true },
    orderBy: { name: "asc" },
  })
}

export async function findActiveServices() {
  return prisma.service.findMany({
    where: { deletedAt: null, isActive: true },
    select: { id: true, name: true, basePrice: true, description: true },
    orderBy: { name: "asc" },
  })
}
