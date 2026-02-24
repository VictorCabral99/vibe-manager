import type { CashFlowDirection, CashFlowStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import {
  calculateCashFlowSummary,
  groupEntriesByPeriod,
  type CashFlowSummary,
} from "./calculations"

// ─────────────────────────────────────────────
// Tipos de retorno
// ─────────────────────────────────────────────

export type CashFlowListItem = Awaited<
  ReturnType<typeof findAllCashFlowEntries>
>[number]

// ─────────────────────────────────────────────
// findAllCashFlowEntries
// ─────────────────────────────────────────────

interface CashFlowFilters {
  direction?: CashFlowDirection
  status?: CashFlowStatus
  fromDate?: Date
  toDate?: Date
}

export async function findAllCashFlowEntries(filters: CashFlowFilters = {}) {
  const { direction, status, fromDate, toDate } = filters

  const rows = await prisma.cashFlowEntry.findMany({
    where: {
      ...(direction !== undefined && { direction }),
      ...(status !== undefined && { status }),
      ...(fromDate !== undefined || toDate !== undefined
        ? {
            dueDate: {
              ...(fromDate !== undefined && { gte: fromDate }),
              ...(toDate !== undefined && { lte: toDate }),
            },
          }
        : {}),
    },
    include: {
      quote: {
        select: {
          id: true,
          client: { select: { name: true } },
        },
      },
      purchase: {
        select: {
          id: true,
          buyer: { select: { user: { select: { name: true } } } },
        },
      },
      laborEntry: {
        select: {
          id: true,
          professional: { select: { name: true } },
        },
      },
      createdBy: { select: { name: true } },
    },
    orderBy: { dueDate: "asc" },
  })

  // Converte Decimal → number para compatibilidade com Client Components
  return rows.map((r) => ({ ...r, amount: r.amount.toNumber() }))
}

// ─────────────────────────────────────────────
// findCashFlowSummary
// ─────────────────────────────────────────────

export async function findCashFlowSummary(): Promise<CashFlowSummary> {
  const entries = await prisma.cashFlowEntry.findMany({
    select: {
      direction: true,
      status: true,
      amount: true,
      dueDate: true,
      paidAt: true,
    },
  })

  return calculateCashFlowSummary(entries)
}

// ─────────────────────────────────────────────
// findEntriesForPeriod
// ─────────────────────────────────────────────

export async function findEntriesForPeriod(
  period: "day" | "week" | "month"
): Promise<Record<string, { in: number; out: number }>> {
  const now = new Date()

  let fromDate: Date
  if (period === "day") {
    // últimos 30 dias
    fromDate = new Date(now)
    fromDate.setDate(fromDate.getDate() - 30)
  } else if (period === "week") {
    // últimas 12 semanas
    fromDate = new Date(now)
    fromDate.setDate(fromDate.getDate() - 84)
  } else {
    // últimos 12 meses
    fromDate = new Date(now)
    fromDate.setMonth(fromDate.getMonth() - 12)
  }

  const entries = await prisma.cashFlowEntry.findMany({
    where: {
      dueDate: { gte: fromDate },
    },
    select: {
      direction: true,
      status: true,
      amount: true,
      dueDate: true,
      paidAt: true,
    },
  })

  return groupEntriesByPeriod(entries, period)
}
