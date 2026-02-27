import { describe, it, expect } from "vitest"
import { calculateQuoteTotals, isQuoteOverdue } from "./calculations"
import { QuoteStatus } from "@prisma/client"

describe("calculateQuoteTotals", () => {
  const emptyItems = () => []
  const emptyServices = () => []

  it("retorna zeros quando não há itens nem serviços", () => {
    const result = calculateQuoteTotals([], [], false)
    expect(result).toEqual({
      subtotalItems: 0,
      subtotalServices: 0,
      subtotal: 0,
      fee: 0,
      total: 0,
    })
  })

  it("calcula subtotal de itens corretamente", () => {
    const items = [
      { productId: "p1", productName: "Cimento", quantity: 10, unitPrice: 35 },
      { productId: "p2", productName: "Areia", quantity: 5, unitPrice: 20 },
    ]
    const result = calculateQuoteTotals(items, [], false)
    expect(result.subtotalItems).toBe(450) // 10*35 + 5*20
    expect(result.subtotalServices).toBe(0)
    expect(result.subtotal).toBe(450)
    expect(result.fee).toBe(0)
    expect(result.total).toBe(450)
  })

  it("calcula subtotal de serviços corretamente", () => {
    const services = [
      { serviceId: "s1", serviceName: "Instalação", quantity: 2, unitPrice: 500 },
    ]
    const result = calculateQuoteTotals([], services, false)
    expect(result.subtotalServices).toBe(1000)
    expect(result.subtotalItems).toBe(0)
    expect(result.total).toBe(1000)
  })

  it("aplica taxa de 15% quando applyFee=true", () => {
    const items = [{ productId: "p1", productName: "Item", quantity: 1, unitPrice: 1000 }]
    const result = calculateQuoteTotals(items, [], true)
    expect(result.subtotal).toBe(1000)
    // bruto = 1000 / 0.85 ≈ 1176.47  →  fee ≈ 176.47  →  líquido = 1000 exato
    expect(result.fee).toBeCloseTo(176.47, 2)
    expect(result.total).toBeCloseTo(1176.47, 2)
  })

  it("não aplica taxa quando applyFee=false", () => {
    const items = [{ productId: "p1", productName: "Item", quantity: 1, unitPrice: 1000 }]
    const result = calculateQuoteTotals(items, [], false)
    expect(result.fee).toBe(0)
    expect(result.total).toBe(1000)
  })

  it("calcula corretamente com itens e serviços juntos", () => {
    const items = [{ productId: "p1", productName: "Material", quantity: 2, unitPrice: 300 }]
    const services = [{ serviceId: "s1", serviceName: "Serviço", quantity: 1, unitPrice: 400 }]
    const result = calculateQuoteTotals(items, services, true)
    // subtotal = 600 + 400 = 1000
    // total = 1000 / 0.85 ≈ 1176.47  →  fee ≈ 176.47  →  líquido = 1000 exato
    expect(result.subtotalItems).toBe(600)
    expect(result.subtotalServices).toBe(400)
    expect(result.subtotal).toBe(1000)
    expect(result.fee).toBeCloseTo(176.47, 2)
    expect(result.total).toBeCloseTo(1176.47, 2)
  })

  it("lida com quantidades fracionadas", () => {
    const items = [{ productId: "p1", productName: "Tinta", quantity: 2.5, unitPrice: 80 }]
    const result = calculateQuoteTotals(items, [], false)
    expect(result.subtotalItems).toBe(200) // 2.5 * 80
  })
})

describe("isQuoteOverdue", () => {
  it("retorna false para orçamentos não-PENDING", () => {
    const pastDate = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000)
    expect(isQuoteOverdue(pastDate, QuoteStatus.APPROVED)).toBe(false)
    expect(isQuoteOverdue(pastDate, QuoteStatus.PAID)).toBe(false)
    expect(isQuoteOverdue(pastDate, QuoteStatus.CANCELLED)).toBe(false)
  })

  it("retorna false para orçamento PENDING com menos de 30 dias", () => {
    const recentDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
    expect(isQuoteOverdue(recentDate, QuoteStatus.PENDING)).toBe(false)
  })

  it("retorna true para orçamento PENDING com mais de 30 dias", () => {
    const oldDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000)
    expect(isQuoteOverdue(oldDate, QuoteStatus.PENDING)).toBe(true)
  })

  it("retorna false exatamente em 30 dias (não vencido ainda)", () => {
    const exactDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    expect(isQuoteOverdue(exactDate, QuoteStatus.PENDING)).toBe(false)
  })
})
