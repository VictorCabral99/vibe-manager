import { prisma } from "@/lib/prisma"
import type { ProductType } from "@prisma/client"

interface FindAllProductsFilters {
  type?: ProductType
  isActive?: boolean
}

export async function findAllProducts(filters?: FindAllProductsFilters) {
  return prisma.product.findMany({
    where: {
      deletedAt: null,
      ...(filters?.type !== undefined && { type: filters.type }),
      ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
    },
    orderBy: { name: "asc" },
  })
}

export type ProductListItem = Awaited<ReturnType<typeof findAllProducts>>[number]

export async function findProductById(id: string) {
  return prisma.product.findFirst({
    where: { id, deletedAt: null },
  })
}

export type ProductDetail = Awaited<ReturnType<typeof findProductById>>

export async function findLowStockProducts() {
  // Busca todos os produtos ativos com estoque mínimo definido
  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
      isActive: true,
      minimumStock: { gt: 0 },
    },
    include: {
      stockEntries: {
        select: { quantity: true },
      },
      stockExits: {
        select: { quantity: true },
      },
    },
    orderBy: { name: "asc" },
  })

  // Filtra apenas os produtos com saldo abaixo do estoque mínimo
  return products.filter((product) => {
    const totalEntries = product.stockEntries.reduce(
      (sum, entry) => sum + Number(entry.quantity),
      0
    )
    const totalExits = product.stockExits.reduce(
      (sum, exit) => sum + Number(exit.quantity),
      0
    )
    const stockBalance = totalEntries - totalExits
    return stockBalance <= product.minimumStock
  })
}

export type LowStockProduct = Awaited<ReturnType<typeof findLowStockProducts>>[number]
