import { prisma } from "@/lib/prisma"

export async function findAllServices(isActive?: boolean) {
  return prisma.service.findMany({
    where: {
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
    },
    orderBy: { name: "asc" },
  })
}

export type ServiceListItem = Awaited<ReturnType<typeof findAllServices>>[number]

export async function findServiceById(id: string) {
  return prisma.service.findFirst({
    where: { id, deletedAt: null },
  })
}

export type ServiceDetail = Awaited<ReturnType<typeof findServiceById>>
