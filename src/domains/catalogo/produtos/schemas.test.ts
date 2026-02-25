import { describe, it, expect } from "vitest"
import { createProductSchema, updateProductSchema } from "./schemas"

const validProduct = {
  name: "Cimento CP-II",
  category: "Materiais de Construção",
  unit: "KG",
  type: "MATERIAL",
  minimumStock: 10,
  isActive: true,
}

// ─────────────────────────────────────────────
// createProductSchema
// ─────────────────────────────────────────────

describe("createProductSchema", () => {
  it("valida produto completo", () => {
    expect(createProductSchema.safeParse(validProduct).success).toBe(true)
  })

  it("valida produto com descrição opcional", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      description: "Cimento de alta resistência",
    })
    expect(result.success).toBe(true)
  })

  it("rejeita nome vazio", () => {
    const result = createProductSchema.safeParse({ ...validProduct, name: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("name")
    }
  })

  it("rejeita categoria vazia", () => {
    const result = createProductSchema.safeParse({ ...validProduct, category: "" })
    expect(result.success).toBe(false)
  })

  it("rejeita unidade de medida inválida", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      unit: "CAIXA_INVALIDA",
    })
    expect(result.success).toBe(false)
  })

  it("aceita todas as unidades válidas", () => {
    const validUnits = ["UNIT", "KG", "METER", "LITER", "BOX", "PACKAGE"]
    for (const unit of validUnits) {
      expect(createProductSchema.safeParse({ ...validProduct, unit }).success).toBe(true)
    }
  })

  it("rejeita tipo de produto inválido", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      type: "TIPO_INVALIDO",
    })
    expect(result.success).toBe(false)
  })

  it("aceita todos os tipos válidos", () => {
    const validTypes = ["MATERIAL", "TOOL"]
    for (const type of validTypes) {
      expect(createProductSchema.safeParse({ ...validProduct, type }).success).toBe(true)
    }
  })

  it("rejeita minimumStock negativo", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      minimumStock: -1,
    })
    expect(result.success).toBe(false)
  })

  it("aceita minimumStock zero (sem estoque mínimo)", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      minimumStock: 0,
    })
    expect(result.success).toBe(true)
  })

  it("rejeita minimumStock fracionado (deve ser inteiro)", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      minimumStock: 5.5,
    })
    expect(result.success).toBe(false)
  })

  it("rejeita quando isActive está ausente", () => {
    const { isActive: _, ...withoutActive } = validProduct
    const result = createProductSchema.safeParse(withoutActive)
    expect(result.success).toBe(false)
  })

  it("aceita isActive=false (produto inativo)", () => {
    const result = createProductSchema.safeParse({
      ...validProduct,
      isActive: false,
    })
    expect(result.success).toBe(true)
  })
})

// ─────────────────────────────────────────────
// updateProductSchema
// ─────────────────────────────────────────────

describe("updateProductSchema", () => {
  it("rejeita sem id", () => {
    const result = updateProductSchema.safeParse(validProduct)
    expect(result.success).toBe(false)
  })

  it("valida com apenas id (atualização parcial)", () => {
    const result = updateProductSchema.safeParse({ id: "prod_123" })
    expect(result.success).toBe(true)
  })

  it("valida atualização completa com id", () => {
    const result = updateProductSchema.safeParse({ ...validProduct, id: "prod_123" })
    expect(result.success).toBe(true)
  })

  it("valida atualização somente do nome", () => {
    const result = updateProductSchema.safeParse({
      id: "prod_123",
      name: "Cimento Novo",
    })
    expect(result.success).toBe(true)
  })

  it("rejeita id vazio", () => {
    const result = updateProductSchema.safeParse({ id: "" })
    expect(result.success).toBe(false)
  })

  it("rejeita unidade inválida mesmo em atualização parcial", () => {
    const result = updateProductSchema.safeParse({
      id: "prod_123",
      unit: "INVALIDA",
    })
    expect(result.success).toBe(false)
  })
})
