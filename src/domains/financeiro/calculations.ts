import type { CashFlowDirection, CashFlowStatus } from "@prisma/client"

// ─────────────────────────────────────────────
// Tipos internos
// ─────────────────────────────────────────────

interface CashFlowEntryLike {
  direction: CashFlowDirection
  status: CashFlowStatus
  amount: { toNumber(): number } | number
  dueDate: Date
  paidAt?: Date | null
}

export interface CashFlowSummary {
  totalReceivable: number // IN PENDING
  totalPayable: number // OUT PENDING
  projectedBalance: number // totalReceivable - totalPayable
  receivedThisMonth: number // IN PAID no mês
  paidThisMonth: number // OUT PAID no mês
  netThisMonth: number // receivedThisMonth - paidThisMonth
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function toNumber(value: { toNumber(): number } | number): number {
  if (typeof value === "number") return value
  return value.toNumber()
}

function isSameMonth(date: Date, reference: Date): boolean {
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth()
  )
}

// ─────────────────────────────────────────────
// calculateCashFlowSummary
// ─────────────────────────────────────────────

export function calculateCashFlowSummary(
  entries: CashFlowEntryLike[]
): CashFlowSummary {
  const now = new Date()

  let totalReceivable = 0
  let totalPayable = 0
  let receivedThisMonth = 0
  let paidThisMonth = 0

  for (const entry of entries) {
    const amount = toNumber(entry.amount)

    if (entry.direction === "IN" && entry.status === "PENDING") {
      totalReceivable += amount
    }

    if (entry.direction === "OUT" && entry.status === "PENDING") {
      totalPayable += amount
    }

    if (entry.direction === "IN" && entry.status === "PAID" && entry.paidAt) {
      if (isSameMonth(new Date(entry.paidAt), now)) {
        receivedThisMonth += amount
      }
    }

    if (entry.direction === "OUT" && entry.status === "PAID" && entry.paidAt) {
      if (isSameMonth(new Date(entry.paidAt), now)) {
        paidThisMonth += amount
      }
    }
  }

  return {
    totalReceivable,
    totalPayable,
    projectedBalance: totalReceivable - totalPayable,
    receivedThisMonth,
    paidThisMonth,
    netThisMonth: receivedThisMonth - paidThisMonth,
  }
}

// ─────────────────────────────────────────────
// groupEntriesByPeriod
// ─────────────────────────────────────────────

export function groupEntriesByPeriod(
  entries: CashFlowEntryLike[],
  period: "day" | "week" | "month"
): Record<string, { in: number; out: number }> {
  const result: Record<string, { in: number; out: number }> = {}

  function getKey(date: Date): string {
    if (period === "day") {
      return date.toISOString().slice(0, 10) // YYYY-MM-DD
    }
    if (period === "month") {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    }
    // week: ISO week
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7))
    const week1 = new Date(d.getFullYear(), 0, 4)
    const weekNum = Math.round(
      ((d.getTime() - week1.getTime()) / 86400000 + 1) / 7
    )
    return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`
  }

  for (const entry of entries) {
    const key = getKey(new Date(entry.dueDate))
    if (!result[key]) result[key] = { in: 0, out: 0 }
    const amount = toNumber(entry.amount)
    if (entry.direction === "IN") {
      result[key].in += amount
    } else {
      result[key].out += amount
    }
  }

  return result
}

// ─────────────────────────────────────────────
// detectOverdueEntries
// ─────────────────────────────────────────────

export function detectOverdueEntries<T extends CashFlowEntryLike>(
  entries: T[]
): T[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return entries.filter((entry) => {
    const due = new Date(entry.dueDate)
    due.setHours(0, 0, 0, 0)
    return due < today && entry.status === "PENDING"
  })
}
