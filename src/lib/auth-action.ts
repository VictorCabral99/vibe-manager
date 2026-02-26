"use server"

import { auth } from "@/auth"
import type { Role } from "@prisma/client"

export interface SessionUser {
  id: string
  role: Role
}

/** Tipo de falha sem genérico para ser assignável a qualquer ActionResult<T> */
export type ActionFailure = { success: false; error: string }

/**
 * Retorna o usuário autenticado da sessão ou `null` se não autenticado.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  return {
    id: session.user.id,
    role: session.user.role as Role,
  }
}

/**
 * Guard helper para server actions.
 * Retorna `{ user }` se autenticado e autorizado, ou `{ error }` para retornar ao cliente.
 *
 * Uso:
 *   const guard = await requirePermission(PERMISSIONS.quotes.create)
 *   if (!guard.user) return guard.error
 */
export async function requirePermission(
  permissionFn: (role: Role) => boolean
): Promise<
  | { user: SessionUser; error?: never }
  | { user?: never; error: ActionFailure }
> {
  const user = await getSessionUser()
  if (!user) {
    return { error: { success: false, error: "Não autenticado" } }
  }
  if (!permissionFn(user.role)) {
    return { error: { success: false, error: "Sem permissão para esta ação" } }
  }
  return { user }
}
