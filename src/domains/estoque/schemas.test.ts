import { describe, it, expect } from "vitest"
import {
  createStockEntrySchema,
  createStockExitSchema,
  createToolLoanSchema,
  returnToolSchema,
} from "./schemas"

// ─────────────────────────────────────────────
// createStockEntrySchema
// ─────────────────────────────────────────────

describe("createStockEntrySchema", () => {
  const valid = { productId: "prod_123", quantity: 50 }

  it("valida entrada de estoque básica", () => {
    expect(createStockEntrySchema.safeParse(valid).success).toBe(true)
  })

  it("valida com notes opcional", () => {
    const result = createStockEntrySchema.safeParse({
      ...valid,
      notes: "Compra do fornecedor X",
    })
    expect(result.success).toBe(true)
  })

  it("rejeita productId vazio", () => {
    const result = createStockEntrySchema.safeParse({ ...valid, productId: "" })
    expect(result.success).toBe(false)
  })

  it("rejeita quantity zero", () => {
    const result = createStockEntrySchema.safeParse({ ...valid, quantity: 0 })
    expect(result.success).toBe(false)
  })

  it("rejeita quantity negativa", () => {
    const result = createStockEntrySchema.safeParse({ ...valid, quantity: -10 })
    expect(result.success).toBe(false)
  })

  it("aceita quantidade fracionada (ex: 2.5 kg)", () => {
    const result = createStockEntrySchema.safeParse({ ...valid, quantity: 2.5 })
    expect(result.success).toBe(true)
  })

  it("rejeita sem productId", () => {
    const result = createStockEntrySchema.safeParse({ quantity: 10 })
    expect(result.success).toBe(false)
  })
})

// ─────────────────────────────────────────────
// createStockExitSchema
// ─────────────────────────────────────────────

describe("createStockExitSchema", () => {
  const valid = { productId: "prod_123", quantity: 10 }

  it("valida saída de estoque básica", () => {
    expect(createStockExitSchema.safeParse(valid).success).toBe(true)
  })

  it("valida com projectId opcional", () => {
    const result = createStockExitSchema.safeParse({
      ...valid,
      projectId: "proj_456",
    })
    expect(result.success).toBe(true)
  })

  it("valida com notes opcional", () => {
    const result = createStockExitSchema.safeParse({
      ...valid,
      notes: "Retirada para obra",
    })
    expect(result.success).toBe(true)
  })

  it("rejeita productId vazio", () => {
    const result = createStockExitSchema.safeParse({ ...valid, productId: "" })
    expect(result.success).toBe(false)
  })

  it("rejeita quantity zero", () => {
    const result = createStockExitSchema.safeParse({ ...valid, quantity: 0 })
    expect(result.success).toBe(false)
  })

  it("rejeita quantity negativa", () => {
    const result = createStockExitSchema.safeParse({ ...valid, quantity: -5 })
    expect(result.success).toBe(false)
  })

  it("aceita sem projectId (retirada avulsa)", () => {
    const result = createStockExitSchema.safeParse(valid)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.projectId).toBeUndefined()
    }
  })
})

// ─────────────────────────────────────────────
// createToolLoanSchema
// ─────────────────────────────────────────────

describe("createToolLoanSchema", () => {
  const valid = {
    productId: "ferr_001",
    quantity: 1,
    employeeId: "emp_123",
  }

  it("valida empréstimo de ferramenta básico", () => {
    expect(createToolLoanSchema.safeParse(valid).success).toBe(true)
  })

  it("valida com projectId e notes opcionais", () => {
    const result = createToolLoanSchema.safeParse({
      ...valid,
      projectId: "proj_456",
      notes: "Emprestada para obra",
    })
    expect(result.success).toBe(true)
  })

  it("rejeita productId vazio", () => {
    const result = createToolLoanSchema.safeParse({ ...valid, productId: "" })
    expect(result.success).toBe(false)
  })

  it("rejeita employeeId vazio", () => {
    const result = createToolLoanSchema.safeParse({ ...valid, employeeId: "" })
    expect(result.success).toBe(false)
  })

  it("rejeita sem employeeId", () => {
    const { employeeId: _, ...withoutEmployee } = valid
    const result = createToolLoanSchema.safeParse(withoutEmployee)
    expect(result.success).toBe(false)
  })

  it("rejeita quantity zero", () => {
    const result = createToolLoanSchema.safeParse({ ...valid, quantity: 0 })
    expect(result.success).toBe(false)
  })

  it("aceita múltiplas ferramentas emprestadas", () => {
    const result = createToolLoanSchema.safeParse({ ...valid, quantity: 3 })
    expect(result.success).toBe(true)
  })
})

// ─────────────────────────────────────────────
// returnToolSchema
// ─────────────────────────────────────────────

describe("returnToolSchema", () => {
  it("valida devolução com toolLoanId", () => {
    const result = returnToolSchema.safeParse({ toolLoanId: "loan_789" })
    expect(result.success).toBe(true)
  })

  it("rejeita toolLoanId vazio", () => {
    const result = returnToolSchema.safeParse({ toolLoanId: "" })
    expect(result.success).toBe(false)
  })

  it("rejeita sem toolLoanId", () => {
    const result = returnToolSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("retorna o id correto quando válido", () => {
    const result = returnToolSchema.safeParse({ toolLoanId: "loan_abc123" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.toolLoanId).toBe("loan_abc123")
    }
  })
})
