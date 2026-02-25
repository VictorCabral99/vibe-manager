import { describe, it, expect } from "vitest"
import { createPurchaseSchema, purchaseItemSchema } from "./schemas"

// ─────────────────────────────────────────────
// purchaseItemSchema
// ─────────────────────────────────────────────

describe("purchaseItemSchema", () => {
  const validItem = {
    productId: "prod_123",
    quantity: 10,
    unitPrice: 25.5,
  }

  it("valida item de compra completo", () => {
    expect(purchaseItemSchema.safeParse(validItem).success).toBe(true)
  })

  it("rejeita productId vazio", () => {
    const result = purchaseItemSchema.safeParse({ ...validItem, productId: "" })
    expect(result.success).toBe(false)
  })

  it("rejeita quantity zero", () => {
    const result = purchaseItemSchema.safeParse({ ...validItem, quantity: 0 })
    expect(result.success).toBe(false)
  })

  it("rejeita quantity negativa", () => {
    const result = purchaseItemSchema.safeParse({ ...validItem, quantity: -5 })
    expect(result.success).toBe(false)
  })

  it("rejeita unitPrice zero", () => {
    const result = purchaseItemSchema.safeParse({ ...validItem, unitPrice: 0 })
    expect(result.success).toBe(false)
  })

  it("rejeita unitPrice negativo", () => {
    const result = purchaseItemSchema.safeParse({ ...validItem, unitPrice: -10 })
    expect(result.success).toBe(false)
  })

  it("aceita quantidade fracionada (ex: 2.5 sacos)", () => {
    const result = purchaseItemSchema.safeParse({ ...validItem, quantity: 2.5 })
    expect(result.success).toBe(true)
  })

  it("aceita preço com centavos", () => {
    const result = purchaseItemSchema.safeParse({ ...validItem, unitPrice: 99.99 })
    expect(result.success).toBe(true)
  })
})

// ─────────────────────────────────────────────
// createPurchaseSchema
// ─────────────────────────────────────────────

describe("createPurchaseSchema", () => {
  const validPurchase = {
    buyerId: "emp_456",
    date: new Date("2024-03-15"),
    items: [
      { productId: "prod_001", quantity: 5, unitPrice: 40 },
      { productId: "prod_002", quantity: 2, unitPrice: 150 },
    ],
  }

  it("valida compra com campos obrigatórios", () => {
    expect(createPurchaseSchema.safeParse(validPurchase).success).toBe(true)
  })

  it("valida compra completa com opcionais", () => {
    const result = createPurchaseSchema.safeParse({
      ...validPurchase,
      supplier: "Distribuidora ABC",
      projectId: "proj_789",
      notes: "Nota fiscal 1234",
    })
    expect(result.success).toBe(true)
  })

  it("rejeita buyerId vazio", () => {
    const result = createPurchaseSchema.safeParse({ ...validPurchase, buyerId: "" })
    expect(result.success).toBe(false)
  })

  it("rejeita sem items", () => {
    const result = createPurchaseSchema.safeParse({ ...validPurchase, items: [] })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/item/i)
    }
  })

  it("rejeita sem buyerId", () => {
    const { buyerId: _, ...withoutBuyer } = validPurchase
    const result = createPurchaseSchema.safeParse(withoutBuyer)
    expect(result.success).toBe(false)
  })

  it("converte date string via coerce", () => {
    const result = createPurchaseSchema.safeParse({
      ...validPurchase,
      date: "2024-03-15",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.date).toBeInstanceOf(Date)
    }
  })

  it("rejeita item com productId vazio dentro de items", () => {
    const result = createPurchaseSchema.safeParse({
      ...validPurchase,
      items: [{ productId: "", quantity: 5, unitPrice: 40 }],
    })
    expect(result.success).toBe(false)
  })

  it("rejeita item com unitPrice negativo dentro de items", () => {
    const result = createPurchaseSchema.safeParse({
      ...validPurchase,
      items: [{ productId: "prod_001", quantity: 5, unitPrice: -10 }],
    })
    expect(result.success).toBe(false)
  })

  it("supplier é opcional", () => {
    const result = createPurchaseSchema.safeParse(validPurchase)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.supplier).toBeUndefined()
    }
  })

  it("projectId é opcional", () => {
    const result = createPurchaseSchema.safeParse(validPurchase)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.projectId).toBeUndefined()
    }
  })

  it("aceita múltiplos itens", () => {
    const result = createPurchaseSchema.safeParse({
      ...validPurchase,
      items: [
        { productId: "p1", quantity: 1, unitPrice: 10 },
        { productId: "p2", quantity: 2, unitPrice: 20 },
        { productId: "p3", quantity: 3, unitPrice: 30 },
      ],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.items).toHaveLength(3)
    }
  })
})
