import { prisma } from "@/lib/prisma"

export async function findAllClients() {
  return prisma.client.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      document: true,
      address: true,
      notes: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          quotes: true,
          projects: true,
        },
      },
    },
    orderBy: { name: "asc" },
  })
}

export type ClientListItem = Awaited<ReturnType<typeof findAllClients>>[number]

export async function findClientById(id: string) {
  return prisma.client.findFirst({
    where: { id, deletedAt: null },
    include: {
      quotes: {
        where: { deletedAt: null },
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      projects: {
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          status: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  })
}

export type ClientDetail = Awaited<ReturnType<typeof findClientById>>
