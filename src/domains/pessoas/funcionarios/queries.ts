import { prisma } from "@/lib/prisma"

// ─────────────────────────────────────────────
// Tipos de retorno
// ─────────────────────────────────────────────

export type EmployeeListItem = Awaited<ReturnType<typeof findAllEmployees>>[number]
export type EmployeeDetail = Awaited<ReturnType<typeof findEmployeeById>>
export type UserWithoutEmployee = Awaited<ReturnType<typeof findUsersWithoutEmployee>>[number]

// ─────────────────────────────────────────────
// Queries de Funcionários
// ─────────────────────────────────────────────

export async function findAllEmployees() {
  return prisma.employee.findMany({
    where: { deletedAt: null },
    include: {
      user: {
        select: {
          email: true,
          role: true,
        },
      },
    },
    orderBy: { name: "asc" },
  })
}

export async function findEmployeeById(id: string) {
  return prisma.employee.findFirst({
    where: { id, deletedAt: null },
    include: {
      user: true,
    },
  })
}

export async function findUsersWithoutEmployee() {
  return prisma.user.findMany({
    where: {
      deletedAt: null,
      employee: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: { name: "asc" },
  })
}
