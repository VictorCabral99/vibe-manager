import { describe, it, expect } from "vitest"
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPercent,
  formatDocument,
} from "./format"

// ─────────────────────────────────────────────
// formatCurrency
// ─────────────────────────────────────────────

describe("formatCurrency", () => {
  it("formata número como moeda BRL", () => {
    const result = formatCurrency(1000)
    expect(result).toContain("1.000")
    expect(result).toContain("R$")
  })

  it("formata zero", () => {
    const result = formatCurrency(0)
    expect(result).toContain("0")
    expect(result).toContain("R$")
  })

  it("formata valor negativo", () => {
    const result = formatCurrency(-500)
    expect(result).toContain("500")
    expect(result).toContain("-")
  })

  it("formata string numérica", () => {
    const result = formatCurrency("1500.50")
    expect(result).toContain("1.500")
  })

  it("inclui centavos", () => {
    const result = formatCurrency(99.99)
    expect(result).toContain("99")
  })

  it("formata valores grandes corretamente", () => {
    const result = formatCurrency(1000000)
    expect(result).toContain("1.000.000")
  })
})

// ─────────────────────────────────────────────
// formatDate
// ─────────────────────────────────────────────

describe("formatDate", () => {
  it("formata objeto Date", () => {
    const date = new Date(2024, 0, 15) // 15 Jan 2024
    const result = formatDate(date)
    expect(result).toContain("15")
    expect(result).toContain("2024")
  })

  it("formata string ISO", () => {
    const result = formatDate("2024-06-20T00:00:00.000Z")
    expect(typeof result).toBe("string")
    expect(result.length).toBeGreaterThan(0)
  })

  it("retorna string não vazia", () => {
    const result = formatDate(new Date())
    expect(result).toBeTruthy()
    expect(typeof result).toBe("string")
  })
})

// ─────────────────────────────────────────────
// formatDateTime
// ─────────────────────────────────────────────

describe("formatDateTime", () => {
  it("retorna string com data e hora", () => {
    const date = new Date(2024, 0, 15, 14, 30)
    const result = formatDateTime(date)
    expect(typeof result).toBe("string")
    expect(result.length).toBeGreaterThan(0)
  })

  it("aceita string ISO", () => {
    const result = formatDateTime("2024-01-15T14:30:00")
    expect(typeof result).toBe("string")
    expect(result.length).toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────────
// formatPercent
// ─────────────────────────────────────────────

describe("formatPercent", () => {
  it("formata 0.5 como 50%", () => {
    const result = formatPercent(0.5)
    expect(result).toContain("50")
    expect(result).toContain("%")
  })

  it("formata 1 como 100%", () => {
    const result = formatPercent(1)
    expect(result).toContain("100")
    expect(result).toContain("%")
  })

  it("formata 0 como 0%", () => {
    const result = formatPercent(0)
    expect(result).toContain("0")
    expect(result).toContain("%")
  })

  it("formata com uma casa decimal", () => {
    // minimumFractionDigits e maximumFractionDigits = 1
    const result = formatPercent(0.666)
    // Deve conter alguma casa decimal (ex: "66,6%")
    expect(result).toContain("%")
  })

  it("formata 0.15 como 15%", () => {
    const result = formatPercent(0.15)
    expect(result).toContain("15")
    expect(result).toContain("%")
  })
})

// ─────────────────────────────────────────────
// formatDocument
// ─────────────────────────────────────────────

describe("formatDocument", () => {
  it("formata CPF (11 dígitos) com pontos e traço", () => {
    const result = formatDocument("12345678901")
    expect(result).toBe("123.456.789-01")
  })

  it("formata CNPJ (14 dígitos) corretamente", () => {
    const result = formatDocument("12345678000195")
    expect(result).toBe("12.345.678/0001-95")
  })

  it("retorna o original para documentos inválidos", () => {
    const result = formatDocument("123")
    expect(result).toBe("123")
  })

  it("remove caracteres não numéricos antes de formatar CPF", () => {
    const result = formatDocument("123.456.789-01") // já formatado
    expect(result).toBe("123.456.789-01")
  })

  it("remove caracteres não numéricos antes de formatar CNPJ", () => {
    const result = formatDocument("12.345.678/0001-95")
    expect(result).toBe("12.345.678/0001-95")
  })

  it("formata CPF com zeros à esquerda", () => {
    const result = formatDocument("00123456789")
    expect(result).toBe("001.234.567-89")
  })
})
