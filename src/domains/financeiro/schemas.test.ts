import { describe, it, expect } from "vitest"
import {
  createExternalPayableSchema,
  markAsPaidSchema,
  updateDueDateSchema,
} from "./schemas"

// ─────────────────────────────────────────────
// createExternalPayableSchema
// ─────────────────────────────────────────────

describe("createExternalPayableSchema", () => {
  const valid = {
    description: "Aluguel do escritório",
    amount: 2500,
    dueDate: new Date("2024-02-10"),
  }

  it("valida conta a pagar completa", () => {
    expect(createExternalPayableSchema.safeParse(valid).success).toBe(true)
  })

  it("rejeita descrição vazia", () => {
    const result = createExternalPayableSchema.safeParse({
      ...valid,
      description: "",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("description")
    }
  })

  it("rejeita valor zero", () => {
    const result = createExternalPayableSchema.safeParse({ ...valid, amount: 0 })
    expect(result.success).toBe(false)
  })

  it("rejeita valor negativo", () => {
    const result = createExternalPayableSchema.safeParse({
      ...valid,
      amount: -100,
    })
    expect(result.success).toBe(false)
  })

  it("aceita valor decimal (centavos)", () => {
    const result = createExternalPayableSchema.safeParse({
      ...valid,
      amount: 150.75,
    })
    expect(result.success).toBe(true)
  })

  it("converte string de data via coerce", () => {
    const result = createExternalPayableSchema.safeParse({
      ...valid,
      dueDate: "2024-03-01",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.dueDate).toBeInstanceOf(Date)
    }
  })

  it("aceita notes opcional", () => {
    const result = createExternalPayableSchema.safeParse({
      ...valid,
      notes: "Pagar até o dia 10",
    })
    expect(result.success).toBe(true)
  })

  it("valida sem notes", () => {
    const result = createExternalPayableSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.notes).toBeUndefined()
    }
  })
})

// ─────────────────────────────────────────────
// markAsPaidSchema
// ─────────────────────────────────────────────

describe("markAsPaidSchema", () => {
  it("valida com apenas id", () => {
    const result = markAsPaidSchema.safeParse({ id: "cf_entry_123" })
    expect(result.success).toBe(true)
  })

  it("valida com id e paidAt", () => {
    const result = markAsPaidSchema.safeParse({
      id: "cf_entry_123",
      paidAt: new Date(),
    })
    expect(result.success).toBe(true)
  })

  it("converte paidAt string via coerce", () => {
    const result = markAsPaidSchema.safeParse({
      id: "cf_entry_123",
      paidAt: "2024-01-20",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.paidAt).toBeInstanceOf(Date)
    }
  })

  it("rejeita id vazio", () => {
    const result = markAsPaidSchema.safeParse({ id: "" })
    expect(result.success).toBe(false)
  })

  it("rejeita sem id", () => {
    const result = markAsPaidSchema.safeParse({ paidAt: new Date() })
    expect(result.success).toBe(false)
  })

  it("paidAt é opcional — omitido usa new Date() na action", () => {
    const result = markAsPaidSchema.safeParse({ id: "cf_entry_123" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.paidAt).toBeUndefined()
    }
  })
})

// ─────────────────────────────────────────────
// updateDueDateSchema
// ─────────────────────────────────────────────

describe("updateDueDateSchema", () => {
  it("valida com id e dueDate", () => {
    const result = updateDueDateSchema.safeParse({
      id: "cf_entry_123",
      dueDate: new Date("2024-12-31"),
    })
    expect(result.success).toBe(true)
  })

  it("converte dueDate string via coerce", () => {
    const result = updateDueDateSchema.safeParse({
      id: "cf_entry_123",
      dueDate: "2024-06-15",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.dueDate).toBeInstanceOf(Date)
    }
  })

  it("rejeita id vazio", () => {
    const result = updateDueDateSchema.safeParse({
      id: "",
      dueDate: new Date(),
    })
    expect(result.success).toBe(false)
  })

  it("rejeita sem dueDate", () => {
    const result = updateDueDateSchema.safeParse({ id: "cf_entry_123" })
    expect(result.success).toBe(false)
  })

  it("aceita datas no passado (reagendamento retroativo)", () => {
    const result = updateDueDateSchema.safeParse({
      id: "cf_entry_123",
      dueDate: new Date("2020-01-01"),
    })
    expect(result.success).toBe(true)
  })

  it("aceita datas no futuro", () => {
    const result = updateDueDateSchema.safeParse({
      id: "cf_entry_123",
      dueDate: new Date("2030-12-31"),
    })
    expect(result.success).toBe(true)
  })
})
