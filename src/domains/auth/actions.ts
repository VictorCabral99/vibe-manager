"use server"

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import { loginSchema, type LoginInput } from "./schemas"
import type { ActionResult } from "@/types"

export async function loginAction(data: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" }
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "E-mail ou senha incorretos" }
        default:
          return { success: false, error: "Erro ao fazer login. Tente novamente." }
      }
    }
    return { success: false, error: "Erro inesperado. Tente novamente." }
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" })
}
