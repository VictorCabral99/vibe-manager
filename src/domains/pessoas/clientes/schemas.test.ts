import { describe, it, expect } from "vitest"
import { createClientSchema, updateClientSchema } from "./schemas"

describe("createClientSchema", () => {
  it("valida cliente com apenas nome", () => {
    const result = createClientSchema.safeParse({ name: "João" })
    expect(result.success).toBe(true)
  })

  it("rejeita nome vazio", () => {
    const result = createClientSchema.safeParse({ name: "" })
    expect(result.success).toBe(false)
  })

  it("valida e-mail quando fornecido", () => {
    const result = createClientSchema.safeParse({
      name: "João",
      email: "joao@email.com",
    })
    expect(result.success).toBe(true)
  })

  it("rejeita e-mail inválido", () => {
    const result = createClientSchema.safeParse({
      name: "João",
      email: "email-invalido",
    })
    expect(result.success).toBe(false)
  })

  it("aceita todos os campos opcionais", () => {
    const result = createClientSchema.safeParse({
      name: "Maria",
      email: "maria@teste.com",
      phone: "(11) 99999-9999",
      document: "12345678901",
      address: "Rua Teste, 123",
      notes: "Cliente preferencial",
    })
    expect(result.success).toBe(true)
  })
})

describe("updateClientSchema", () => {
  it("exige id", () => {
    const result = updateClientSchema.safeParse({ name: "João" })
    expect(result.success).toBe(false)
  })

  it("valida com apenas id", () => {
    const result = updateClientSchema.safeParse({ id: "clxxx789" })
    expect(result.success).toBe(true)
  })
})
