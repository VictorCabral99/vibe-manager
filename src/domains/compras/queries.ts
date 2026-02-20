import { prisma } from "@/lib/prisma"

// ─────────────────────────────────────────────
// Listagem de compras
// ─────────────────────────────────────────────

interface PurchaseFilters {
  buyerId?: string
  fromDate?: Date
  toDate?: Date
}

export async function findAllPurchases(filters?: PurchaseFilters) {
  return prisma.purchase.findMany({
    where: {
      ...(filters?.buyerId ? { buyerId: filters.buyerId } : {}),
      ...(filters?.fromDate || filters?.toDate
        ? {
            date: {
              ...(filters.fromDate ? { gte: filters.fromDate } : {}),
              ...(filters.toDate ? { lte: filters.toDate } : {}),
            },
          }
        : {}),
    },
    select: {
      id: true,
      date: true,
      supplier: true,
      totalAmount: true,
      notes: true,
      createdAt: true,
      buyer: {
        select: {
          id: true,
          name: true,
          user: { select: { id: true, name: true } },
        },
      },
      project: {
        select: { id: true, name: true },
      },
      _count: {
        select: { items: true },
      },
    },
    orderBy: { date: "desc" },
  })
}

export type PurchaseListItem = Awaited<ReturnType<typeof findAllPurchases>>[number]

// ─────────────────────────────────────────────
// Detalhe de compra
// ─────────────────────────────────────────────

export async function findPurchaseById(id: string) {
  return prisma.purchase.findFirst({
    where: { id },
    include: {
      buyer: {
        include: { user: { select: { id: true, name: true } } },
      },
      project: { select: { id: true, name: true } },
      items: {
        include: {
          product: {
            select: { id: true, name: true, unit: true, category: true },
          },
        },
      },
    },
  })
}

export type PurchaseDetail = Awaited<ReturnType<typeof findPurchaseById>>

// ─────────────────────────────────────────────
// Compradores ativos (employees com canPurchase)
// ─────────────────────────────────────────────

export async function findActiveBuyers() {
  return prisma.employee.findMany({
    where: { deletedAt: null, isActive: true, canPurchase: true },
    select: {
      id: true,
      name: true,
      jobTitle: true,
      user: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  })
}

export type BuyerItem = Awaited<ReturnType<typeof findActiveBuyers>>[number]
