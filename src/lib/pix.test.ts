import { describe, it, expect } from "vitest"
import { buildPixPayload } from "./pix"

describe("buildPixPayload", () => {
  const baseOptions = {
    pixKey: "contato@empresa.com.br",
    recipientName: "Empresa Teste",
    city: "SAO PAULO",
  }

  it("gera um payload com 4 caracteres de CRC16 no final", () => {
    const payload = buildPixPayload(baseOptions)
    // Formato: ...6304XXXX (6304 = ID do campo CRC, seguido de 4 hex chars)
    expect(payload).toMatch(/6304[0-9A-F]{4}$/)
  })

  it("inclui a chave PIX no payload", () => {
    const payload = buildPixPayload(baseOptions)
    expect(payload).toContain("contato@empresa.com.br")
  })

  it("inclui o nome do recebedor no payload", () => {
    const payload = buildPixPayload(baseOptions)
    expect(payload).toContain("Empresa Teste")
  })

  it("inclui o identificador PIX (br.gov.bcb.pix)", () => {
    const payload = buildPixPayload(baseOptions)
    expect(payload).toContain("br.gov.bcb.pix")
  })

  it("inclui o código de país BR", () => {
    const payload = buildPixPayload(baseOptions)
    expect(payload).toContain("5802BR")
  })

  it("inclui o código de moeda BRL (986)", () => {
    const payload = buildPixPayload(baseOptions)
    expect(payload).toContain("5303986")
  })

  it("inclui o valor quando informado", () => {
    const payload = buildPixPayload({ ...baseOptions, amount: 150.50 })
    expect(payload).toContain("150.50")
  })

  it("não inclui campo de valor quando não informado", () => {
    const payload = buildPixPayload(baseOptions)
    // Campo 54 é o valor — não deve aparecer sem amount
    expect(payload).not.toMatch(/5406/)
    expect(payload).not.toMatch(/5405/)
  })

  it("gera payloads diferentes para valores diferentes", () => {
    const payload1 = buildPixPayload({ ...baseOptions, amount: 100 })
    const payload2 = buildPixPayload({ ...baseOptions, amount: 200 })
    expect(payload1).not.toBe(payload2)
  })

  it("remove acentos do nome do recebedor", () => {
    const payload = buildPixPayload({
      ...baseOptions,
      recipientName: "João Cação",
    })
    // Não deve conter caracteres acentuados
    expect(payload).not.toMatch(/[àáâãäåçèéêëìíîïñòóôõöùúûü]/i)
  })

  it("trunca nome do recebedor para 25 caracteres", () => {
    const longName = "Nome Muito Longo Para Caber Aqui"
    const payload = buildPixPayload({ ...baseOptions, recipientName: longName })
    // O nome truncado de 25 chars deve estar presente
    expect(payload).toContain(longName.slice(0, 25))
    // Mas o nome completo não deve estar
    expect(payload).not.toContain(longName)
  })

  it("trunca cidade para 15 caracteres", () => {
    const longCity = "CIDADE MUITO LONGA AQUI"
    const payload = buildPixPayload({ ...baseOptions, city: longCity })
    expect(payload).toContain(longCity.slice(0, 15))
  })

  it("gera CRC16 determinístico para os mesmos inputs", () => {
    const payload1 = buildPixPayload({ ...baseOptions, amount: 99.99 })
    const payload2 = buildPixPayload({ ...baseOptions, amount: 99.99 })
    expect(payload1).toBe(payload2)
  })

  it("começa com 000201 (Payload Format Indicator)", () => {
    const payload = buildPixPayload(baseOptions)
    expect(payload).toMatch(/^000201/)
  })
})
