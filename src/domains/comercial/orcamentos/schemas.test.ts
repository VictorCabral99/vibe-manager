import { describe, it, expect } from "vitest"
import { createQuoteSchema, changeQuoteStatusSchema } from "./schemas"

describe("createQuoteSchema", () => {
  const validItem = { productId: "clxxx123", quantity: 2, unitPrice: 100 }
  const validService = { serviceId: "clxxx456", quantity: 1, unitPrice: 200 }

  it("valida orçamento com apenas itens", () => {
    const result = createQuoteSchema.safeParse({
      clientId: "clxxx789",
      applyFee: false,
      items: [validItem],
      services: [],
    })
    expect(result.success).toBe(true)
  })

  it("valida orçamento com apenas serviços", () => {
    const result = createQuoteSchema.safeParse({
      clientId: "clxxx789",
      applyFee: true,
      items: [],
      services: [validService],
    })
    expect(result.success).toBe(true)
  })

  it("rejeita orçamento sem itens nem serviços", () => {
    const result = createQuoteSchema.safeParse({
      clientId: "clxxx789",
      applyFee: false,
      items: [],
      services: [],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/item|serviço/i)
    }
  })

  it("rejeita clientId vazio", () => {
    const result = createQuoteSchema.safeParse({
      clientId: "",
      applyFee: false,
      items: [validItem],
      services: [],
    })
    expect(result.success).toBe(false)
  })

  it("rejeita item com quantity negativa", () => {
    const result = createQuoteSchema.safeParse({
      clientId: "clxxx789",
      applyFee: false,
      items: [{ ...validItem, quantity: -1 }],
      services: [],
    })
    expect(result.success).toBe(false)
  })

  it("rejeita item com unitPrice negativo", () => {
    const result = createQuoteSchema.safeParse({
      clientId: "clxxx789",
      applyFee: false,
      items: [{ ...validItem, unitPrice: -10 }],
      services: [],
    })
    expect(result.success).toBe(false)
  })

  it("aceita unitPrice zero (item de cortesia)", () => {
    const result = createQuoteSchema.safeParse({
      clientId: "clxxx789",
      applyFee: false,
      items: [{ ...validItem, unitPrice: 0 }],
      services: [],
    })
    expect(result.success).toBe(true)
  })

  it("aceita notas opcionais", () => {
    const result = createQuoteSchema.safeParse({
      clientId: "clxxx789",
      applyFee: false,
      items: [validItem],
      services: [],
      notes: "Validade: 30 dias",
    })
    expect(result.success).toBe(true)
  })
})

describe("changeQuoteStatusSchema", () => {
  it("valida mudança de status válida", () => {
    const result = changeQuoteStatusSchema.safeParse({
      quoteId: "clxxx789",
      newStatus: "APPROVED",
    })
    expect(result.success).toBe(true)
  })

  it("rejeita status inválido", () => {
    const result = changeQuoteStatusSchema.safeParse({
      quoteId: "clxxx789",
      newStatus: "INVALIDO",
    })
    expect(result.success).toBe(false)
  })

  it("aceita todos os status válidos", () => {
    for (const status of ["PENDING", "APPROVED", "PAID", "CANCELLED"]) {
      const result = changeQuoteStatusSchema.safeParse({
        quoteId: "clxxx789",
        newStatus: status,
      })
      expect(result.success).toBe(true)
    }
  })
})
