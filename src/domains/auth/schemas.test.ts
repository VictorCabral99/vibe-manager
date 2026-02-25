import { describe, it, expect } from "vitest"
import { loginSchema, resetPasswordRequestSchema, resetPasswordSchema } from "./schemas"

// ─────────────────────────────────────────────
// loginSchema
// ─────────────────────────────────────────────

describe("loginSchema", () => {
  it("valida credenciais corretas", () => {
    const result = loginSchema.safeParse({
      email: "admin@empresa.com",
      password: "senha123",
    })
    expect(result.success).toBe(true)
  })

  it("rejeita e-mail inválido", () => {
    const result = loginSchema.safeParse({
      email: "nao-e-email",
      password: "senha123",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/inválido/i)
    }
  })

  it("rejeita e-mail vazio", () => {
    const result = loginSchema.safeParse({ email: "", password: "senha123" })
    expect(result.success).toBe(false)
  })

  it("rejeita senha com menos de 6 caracteres", () => {
    const result = loginSchema.safeParse({
      email: "admin@empresa.com",
      password: "abc",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/6/i)
    }
  })

  it("rejeita senha vazia", () => {
    const result = loginSchema.safeParse({
      email: "admin@empresa.com",
      password: "",
    })
    expect(result.success).toBe(false)
  })

  it("aceita senha com exatamente 6 caracteres", () => {
    const result = loginSchema.safeParse({
      email: "user@teste.com",
      password: "abc123",
    })
    expect(result.success).toBe(true)
  })

  it("aceita e-mails com subdomínio", () => {
    const result = loginSchema.safeParse({
      email: "user@mail.empresa.com.br",
      password: "senha12345",
    })
    expect(result.success).toBe(true)
  })
})

// ─────────────────────────────────────────────
// resetPasswordRequestSchema
// ─────────────────────────────────────────────

describe("resetPasswordRequestSchema", () => {
  it("valida e-mail válido", () => {
    const result = resetPasswordRequestSchema.safeParse({
      email: "usuario@empresa.com",
    })
    expect(result.success).toBe(true)
  })

  it("rejeita e-mail inválido", () => {
    const result = resetPasswordRequestSchema.safeParse({ email: "invalido" })
    expect(result.success).toBe(false)
  })

  it("rejeita campo vazio", () => {
    const result = resetPasswordRequestSchema.safeParse({ email: "" })
    expect(result.success).toBe(false)
  })
})

// ─────────────────────────────────────────────
// resetPasswordSchema
// ─────────────────────────────────────────────

describe("resetPasswordSchema", () => {
  it("valida quando as senhas coincidem", () => {
    const result = resetPasswordSchema.safeParse({
      password: "novaSenha123",
      confirmPassword: "novaSenha123",
    })
    expect(result.success).toBe(true)
  })

  it("rejeita quando as senhas não coincidem", () => {
    const result = resetPasswordSchema.safeParse({
      password: "novaSenha123",
      confirmPassword: "outraSenha",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const confirmError = result.error.issues.find(
        (i) => i.path.includes("confirmPassword")
      )
      expect(confirmError?.message).toMatch(/coincidem/i)
    }
  })

  it("rejeita senha com menos de 6 caracteres", () => {
    const result = resetPasswordSchema.safeParse({
      password: "abc",
      confirmPassword: "abc",
    })
    expect(result.success).toBe(false)
  })

  it("rejeita confirmPassword vazio mesmo com password válido", () => {
    const result = resetPasswordSchema.safeParse({
      password: "senha123",
      confirmPassword: "",
    })
    expect(result.success).toBe(false)
  })

  it("aceita senha com exatamente 6 caracteres iguais", () => {
    const result = resetPasswordSchema.safeParse({
      password: "abc123",
      confirmPassword: "abc123",
    })
    expect(result.success).toBe(true)
  })
})
