import { describe, it, expect } from "vitest"
import { calculateProjectMargin } from "./calculations"

const makeProject = (overrides?: Partial<{
  totalRevenue: number
  targetMargin: number
  expenses: { amount: number }[]
  laborEntries: { total: number }[]
}>) => ({
  totalRevenue: 10000,
  targetMargin: 0.6,
  expenses: [],
  laborEntries: [],
  ...overrides,
})

describe("calculateProjectMargin", () => {
  it("retorna métricas zerando quando não há despesas", () => {
    const result = calculateProjectMargin(makeProject())
    expect(result.totalExpenses).toBe(0)
    expect(result.margin).toBe(10000)
    expect(result.marginPercent).toBe(1)
    expect(result.consumptionPercent).toBe(0)
    expect(result.health).toBe("healthy")
  })

  it("soma despesas de materiais e mão de obra", () => {
    const result = calculateProjectMargin(makeProject({
      expenses: [{ amount: 1000 }, { amount: 500 }],
      laborEntries: [{ total: 300 }],
    }))
    expect(result.totalExpenses).toBe(1800)
    expect(result.margin).toBe(8200)
  })

  it("classifica como 'healthy' quando consumo < 80% da meta", () => {
    // targetMargin = 0.6, consumo deve ser < 0.48 (48%)
    const result = calculateProjectMargin(makeProject({
      expenses: [{ amount: 4000 }], // 40% consumido
    }))
    expect(result.consumptionPercent).toBeCloseTo(0.4)
    expect(result.health).toBe("healthy")
  })

  it("classifica como 'warning' quando consumo está entre 80% e 100% da meta", () => {
    // targetMargin = 0.6, warning quando 48% <= consumo < 60%
    const result = calculateProjectMargin(makeProject({
      expenses: [{ amount: 5000 }], // 50% consumido
    }))
    expect(result.consumptionPercent).toBeCloseTo(0.5)
    expect(result.health).toBe("warning")
  })

  it("classifica como 'danger' quando consumo >= meta", () => {
    // targetMargin = 0.6, danger quando >= 60%
    const result = calculateProjectMargin(makeProject({
      expenses: [{ amount: 7000 }], // 70% consumido
    }))
    expect(result.consumptionPercent).toBeCloseTo(0.7)
    expect(result.health).toBe("danger")
  })

  it("calcula marginPercent corretamente", () => {
    const result = calculateProjectMargin(makeProject({
      expenses: [{ amount: 3000 }],
    }))
    // margin = 10000 - 3000 = 7000, marginPercent = 7000/10000 = 0.7
    expect(result.margin).toBe(7000)
    expect(result.marginPercent).toBeCloseTo(0.7)
  })

  it("lida com receita zero sem dividir por zero", () => {
    const result = calculateProjectMargin(makeProject({
      totalRevenue: 0,
      expenses: [{ amount: 500 }],
    }))
    expect(result.marginPercent).toBe(0)
    expect(result.consumptionPercent).toBe(0)
  })

  it("classifica corretamente com margem alvo diferente de 60%", () => {
    // targetMargin = 0.4, healthy < 32%, warning 32%-40%, danger >= 40%
    const result = calculateProjectMargin(makeProject({
      targetMargin: 0.4,
      expenses: [{ amount: 3500 }], // 35% consumido → warning
    }))
    expect(result.health).toBe("warning")
  })
})
