import { describe, it, expect } from "vitest"
import {
  createProjectSchema,
  createExpenseSchema,
  createLaborProfessionalSchema,
  createLaborEntrySchema,
} from "./schemas"

describe("createProjectSchema", () => {
  const valid = {
    name: "Obra Residencial",
    clientId: "clxxx789",
    totalRevenue: 50000,
    targetMargin: 0.6,
  }

  it("valida projeto com todos os campos obrigatórios", () => {
    expect(createProjectSchema.safeParse(valid).success).toBe(true)
  })

  it("rejeita nome vazio", () => {
    expect(createProjectSchema.safeParse({ ...valid, name: "" }).success).toBe(false)
  })

  it("rejeita receita zero ou negativa", () => {
    expect(createProjectSchema.safeParse({ ...valid, totalRevenue: 0 }).success).toBe(false)
    expect(createProjectSchema.safeParse({ ...valid, totalRevenue: -100 }).success).toBe(false)
  })

  it("aceita targetMargin entre 0 e 1", () => {
    expect(createProjectSchema.safeParse({ ...valid, targetMargin: 0 }).success).toBe(true)
    expect(createProjectSchema.safeParse({ ...valid, targetMargin: 1 }).success).toBe(true)
    expect(createProjectSchema.safeParse({ ...valid, targetMargin: 0.75 }).success).toBe(true)
  })

  it("rejeita targetMargin acima de 1", () => {
    expect(createProjectSchema.safeParse({ ...valid, targetMargin: 1.1 }).success).toBe(false)
  })

})

describe("createExpenseSchema", () => {
  const valid = {
    projectId: "clxxx789",
    type: "MATERIAL",
    description: "Cimento 50kg",
    amount: 150,
    date: new Date(),
  }

  it("valida despesa completa", () => {
    expect(createExpenseSchema.safeParse(valid).success).toBe(true)
  })

  it("rejeita amount zero", () => {
    expect(createExpenseSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false)
  })

  it("rejeita amount negativo", () => {
    expect(createExpenseSchema.safeParse({ ...valid, amount: -50 }).success).toBe(false)
  })

  it("rejeita description vazia", () => {
    expect(createExpenseSchema.safeParse({ ...valid, description: "" }).success).toBe(false)
  })

  it("aceita todos os tipos de despesa", () => {
    for (const type of ["MATERIAL", "LABOR", "OTHER"]) {
      expect(createExpenseSchema.safeParse({ ...valid, type }).success).toBe(true)
    }
  })

  it("converte string de data via coerce", () => {
    const result = createExpenseSchema.safeParse({
      ...valid,
      date: "2024-01-15",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.date).toBeInstanceOf(Date)
    }
  })
})

describe("createLaborProfessionalSchema", () => {
  it("valida profissional com campos obrigatórios", () => {
    const result = createLaborProfessionalSchema.safeParse({
      name: "João Silva",
      dailyRate: 250,
    })
    expect(result.success).toBe(true)
  })

  it("rejeita diária zero", () => {
    const result = createLaborProfessionalSchema.safeParse({
      name: "João",
      dailyRate: 0,
    })
    expect(result.success).toBe(false)
  })

  it("aceita telefone opcional", () => {
    const result = createLaborProfessionalSchema.safeParse({
      name: "Maria",
      dailyRate: 300,
      phone: "(11) 99999-9999",
    })
    expect(result.success).toBe(true)
  })
})

describe("createLaborEntrySchema", () => {
  const valid = {
    professionalId: "clxxx111",
    projectId: "clxxx789",
    date: new Date(),
    quantity: 1,
  }

  it("valida lançamento com campos obrigatórios", () => {
    expect(createLaborEntrySchema.safeParse(valid).success).toBe(true)
  })

  it("rejeita quantity zero", () => {
    expect(createLaborEntrySchema.safeParse({ ...valid, quantity: 0 }).success).toBe(false)
  })

  it("aceita quantidade fracionada (meio período)", () => {
    expect(createLaborEntrySchema.safeParse({ ...valid, quantity: 0.5 }).success).toBe(true)
  })

  it("aceita description opcional", () => {
    expect(createLaborEntrySchema.safeParse({ ...valid, description: "Pintura sala" }).success).toBe(true)
  })
})
