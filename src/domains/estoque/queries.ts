import { prisma } from "@/lib/prisma"

// ─────────────────────────────────────────────
// Saldo de Estoque por Produto
// ─────────────────────────────────────────────

export async function findStockBalance() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null, isActive: true },
    select: {
      id: true,
      name: true,
      category: true,
      unit: true,
      type: true,
      minimumStock: true,
    },
    orderBy: { name: "asc" },
  })

  // Agregações de entradas por produto
  const entriesByProduct = await prisma.stockEntry.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
  })

  // Agregações de saídas por produto
  const exitsByProduct = await prisma.stockExit.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
  })

  // Empréstimos de ferramentas ainda não devolvidos
  const activeLoans = await prisma.toolLoan.groupBy({
    by: ["productId"],
    where: { returnedAt: null },
    _sum: { quantity: true },
  })

  const entriesMap = new Map(
    entriesByProduct.map((e) => [e.productId, Number(e._sum.quantity ?? 0)])
  )
  const exitsMap = new Map(
    exitsByProduct.map((e) => [e.productId, Number(e._sum.quantity ?? 0)])
  )
  const loansMap = new Map(
    activeLoans.map((l) => [l.productId, Number(l._sum.quantity ?? 0)])
  )

  return products.map((product) => {
    const totalIn = entriesMap.get(product.id) ?? 0
    const totalOut = exitsMap.get(product.id) ?? 0
    const loanedOut = loansMap.get(product.id) ?? 0
    const balance = totalIn - totalOut - loanedOut
    const isLow = balance <= product.minimumStock

    return {
      product,
      totalIn,
      totalOut,
      loanedOut,
      balance,
      isLow,
    }
  })
}

export type StockBalanceItem = Awaited<ReturnType<typeof findStockBalance>>[number]

// ─────────────────────────────────────────────
// Histórico de Entradas
// ─────────────────────────────────────────────

export async function findStockEntries(productId?: string) {
  return prisma.stockEntry.findMany({
    where: productId ? { productId } : undefined,
    include: {
      product: { select: { id: true, name: true, unit: true } },
      registeredBy: { select: { id: true, name: true } },
      purchaseItem: {
        include: {
          purchase: { select: { id: true, supplier: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export type StockEntryItem = Awaited<ReturnType<typeof findStockEntries>>[number]

// ─────────────────────────────────────────────
// Histórico de Saídas
// ─────────────────────────────────────────────

export async function findStockExits(productId?: string) {
  return prisma.stockExit.findMany({
    where: productId ? { productId } : undefined,
    include: {
      product: { select: { id: true, name: true, unit: true } },
      project: { select: { id: true, name: true } },
      registeredBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export type StockExitItem = Awaited<ReturnType<typeof findStockExits>>[number]

// ─────────────────────────────────────────────
// Empréstimos ativos de ferramentas
// ─────────────────────────────────────────────

export async function findActiveToolLoans() {
  return prisma.toolLoan.findMany({
    where: { returnedAt: null },
    include: {
      product: { select: { id: true, name: true, unit: true } },
      employee: {
        include: { user: { select: { id: true, name: true } } },
      },
    },
    orderBy: { loanedAt: "desc" },
  })
}

export type ToolLoanItem = Awaited<ReturnType<typeof findActiveToolLoans>>[number]

// ─────────────────────────────────────────────
// Todos os empréstimos de ferramentas (com histórico)
// ─────────────────────────────────────────────

export async function findAllToolLoans() {
  return prisma.toolLoan.findMany({
    include: {
      product: { select: { id: true, name: true, unit: true } },
      employee: {
        include: { user: { select: { id: true, name: true } } },
      },
    },
    orderBy: { loanedAt: "desc" },
  })
}

export type AllToolLoanItem = Awaited<ReturnType<typeof findAllToolLoans>>[number]
