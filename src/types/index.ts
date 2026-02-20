import type { Role } from "@prisma/client"

// ─────────────────────────────────────────────
// Tipos compartilhados entre domínios
// ─────────────────────────────────────────────

export type { Role }

export interface SessionUser {
  id: string
  name: string
  email: string
  role: Role
}

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

export type PaginatedResult<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
