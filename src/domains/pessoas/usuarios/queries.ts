import { prisma } from "@/lib/prisma"

// ─────────────────────────────────────────────
// Tipos de retorno
// ─────────────────────────────────────────────

export type UserListItem = Awaited<ReturnType<typeof findAllUsers>>[number]
export type UserDetail = Awaited<ReturnType<typeof findUserById>>

// ─────────────────────────────────────────────
// Queries de Usuários
// ─────────────────────────────────────────────

export async function findAllUsers() {
  return prisma.user.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      employee: {
        select: {
          id: true,
          name: true,
          jobTitle: true,
        },
      },
    },
    orderBy: { name: "asc" },
  })
}

export async function findUserById(id: string) {
  return prisma.user.findFirst({
    where: { id, deletedAt: null },
    include: {
      employee: true,
    },
  })
}

export async function findUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: { email, deletedAt: null },
  })
}
