import { prisma } from "@/lib/prisma"

export async function findAllServices(isActive?: boolean) {
  const services = await prisma.service.findMany({
    where: {
      deletedAt: null,
      ...(isActive !== undefined && { isActive }),
    },
    orderBy: { name: "asc" },
  })
  return services.map((s) => ({ ...s, basePrice: Number(s.basePrice) }))
}

export type ServiceListItem = Awaited<ReturnType<typeof findAllServices>>[number]

export async function findServiceById(id: string) {
  const service = await prisma.service.findFirst({
    where: { id, deletedAt: null },
  })
  if (!service) return null
  return { ...service, basePrice: Number(service.basePrice) }
}

export type ServiceDetail = Awaited<ReturnType<typeof findServiceById>>
