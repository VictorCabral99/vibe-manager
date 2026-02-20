import { describe, it, expect, beforeEach } from "vitest"
import {
  calculateCashFlowSummary,
  groupEntriesByPeriod,
  detectOverdueEntries,
} from "./calculations"

type Direction = "IN" | "OUT"
type Status = "PENDING" | "PAID"

function makeEntry(overrides: {
  direction: Direction
  status: Status
  amount: number
  dueDate?: Date
  paidAt?: Date | null
}) {
  return {
    direction: overrides.direction,
    status: overrides.status,
    amount: overrides.amount,
    dueDate: overrides.dueDate ?? new Date(),
    paidAt: overrides.paidAt ?? null,
  }
}

describe("calculateCashFlowSummary", () => {
  it("retorna zeros para lista vazia", () => {
    const result = calculateCashFlowSummary([])
    expect(result.totalReceivable).toBe(0)
    expect(result.totalPayable).toBe(0)
    expect(result.projectedBalance).toBe(0)
    expect(result.receivedThisMonth).toBe(0)
    expect(result.paidThisMonth).toBe(0)
    expect(result.netThisMonth).toBe(0)
  })

  it("soma entradas pendentes em totalReceivable", () => {
    const entries = [
      makeEntry({ direction: "IN", status: "PENDING", amount: 1000 }),
      makeEntry({ direction: "IN", status: "PENDING", amount: 500 }),
      makeEntry({ direction: "IN", status: "PAID", amount: 200 }), // não conta
    ]
    const result = calculateCashFlowSummary(entries)
    expect(result.totalReceivable).toBe(1500)
  })

  it("soma saídas pendentes em totalPayable", () => {
    const entries = [
      makeEntry({ direction: "OUT", status: "PENDING", amount: 800 }),
      makeEntry({ direction: "OUT", status: "PAID", amount: 400 }), // não conta
    ]
    const result = calculateCashFlowSummary(entries)
    expect(result.totalPayable).toBe(800)
  })

  it("calcula projectedBalance como receivable - payable", () => {
    const entries = [
      makeEntry({ direction: "IN", status: "PENDING", amount: 2000 }),
      makeEntry({ direction: "OUT", status: "PENDING", amount: 800 }),
    ]
    const result = calculateCashFlowSummary(entries)
    expect(result.projectedBalance).toBe(1200)
  })

  it("conta recebimentos pagos neste mês", () => {
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 15)
    const entries = [
      makeEntry({ direction: "IN", status: "PAID", amount: 1000, paidAt: thisMonth }),
      makeEntry({ direction: "IN", status: "PAID", amount: 500, paidAt: thisMonth }),
    ]
    const result = calculateCashFlowSummary(entries)
    expect(result.receivedThisMonth).toBe(1500)
  })

  it("não conta recebimentos de mês passado", () => {
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    const entries = [
      makeEntry({ direction: "IN", status: "PAID", amount: 1000, paidAt: lastMonth }),
    ]
    const result = calculateCashFlowSummary(entries)
    expect(result.receivedThisMonth).toBe(0)
  })

  it("calcula netThisMonth corretamente", () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), 10)
    const entries = [
      makeEntry({ direction: "IN", status: "PAID", amount: 3000, paidAt: today }),
      makeEntry({ direction: "OUT", status: "PAID", amount: 1200, paidAt: today }),
    ]
    const result = calculateCashFlowSummary(entries)
    expect(result.netThisMonth).toBe(1800)
  })
})

describe("detectOverdueEntries", () => {
  it("detecta entradas com vencimento passado e status PENDING", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const entries = [
      makeEntry({ direction: "OUT", status: "PENDING", amount: 500, dueDate: yesterday }),
    ]
    const overdue = detectOverdueEntries(entries)
    expect(overdue).toHaveLength(1)
  })

  it("não inclui entradas pagas mesmo com vencimento passado", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const entries = [
      makeEntry({ direction: "OUT", status: "PAID", amount: 500, dueDate: yesterday }),
    ]
    const overdue = detectOverdueEntries(entries)
    expect(overdue).toHaveLength(0)
  })

  it("não inclui entradas com vencimento futuro", () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const entries = [
      makeEntry({ direction: "OUT", status: "PENDING", amount: 500, dueDate: tomorrow }),
    ]
    const overdue = detectOverdueEntries(entries)
    expect(overdue).toHaveLength(0)
  })
})

describe("groupEntriesByPeriod", () => {
  it("agrupa entradas por mês corretamente", () => {
    const jan = new Date(2024, 0, 15) // Janeiro 2024
    const feb = new Date(2024, 1, 10) // Fevereiro 2024
    const entries = [
      makeEntry({ direction: "IN", status: "PENDING", amount: 1000, dueDate: jan }),
      makeEntry({ direction: "OUT", status: "PENDING", amount: 500, dueDate: jan }),
      makeEntry({ direction: "IN", status: "PENDING", amount: 2000, dueDate: feb }),
    ]
    const result = groupEntriesByPeriod(entries, "month")
    expect(result["2024-01"]).toEqual({ in: 1000, out: 500 })
    expect(result["2024-02"]).toEqual({ in: 2000, out: 0 })
  })

  it("agrupa entradas por dia corretamente", () => {
    const day1 = new Date(2024, 0, 15)
    const day2 = new Date(2024, 0, 16)
    const entries = [
      makeEntry({ direction: "IN", status: "PENDING", amount: 300, dueDate: day1 }),
      makeEntry({ direction: "OUT", status: "PENDING", amount: 100, dueDate: day2 }),
    ]
    const result = groupEntriesByPeriod(entries, "day")
    expect(result["2024-01-15"]).toEqual({ in: 300, out: 0 })
    expect(result["2024-01-16"]).toEqual({ in: 0, out: 100 })
  })

  it("retorna objeto vazio para lista vazia", () => {
    const result = groupEntriesByPeriod([], "month")
    expect(result).toEqual({})
  })
})
