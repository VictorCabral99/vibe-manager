import { prisma } from "@/lib/prisma"
import { QuoteStatus, ProjectStatus, CashFlowDirection, AlertStatus } from "@prisma/client"

// ─────────────────────────────────────────────
// Dados consolidados do Dashboard
// ─────────────────────────────────────────────

export async function getDashboardData() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfYear = new Date(now.getFullYear(), 0, 1)

  const [
    monthlyIn,
    monthlyOut,
    yearlyIn,
    yearlyOut,
    pendingReceivable,
    pendingPayable,
    quoteStats,
    recentQuotes,
    activeProjectsCount,
    recentProjects,
    lowStockProducts,
    openAlerts,
  ] = await Promise.all([
    prisma.cashFlowEntry.aggregate({
      where: { direction: CashFlowDirection.IN, paidAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.cashFlowEntry.aggregate({
      where: { direction: CashFlowDirection.OUT, paidAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
    prisma.cashFlowEntry.aggregate({
      where: { direction: CashFlowDirection.IN, paidAt: { gte: startOfYear } },
      _sum: { amount: true },
    }),
    prisma.cashFlowEntry.aggregate({
      where: { direction: CashFlowDirection.OUT, paidAt: { gte: startOfYear } },
      _sum: { amount: true },
    }),
    prisma.cashFlowEntry.aggregate({
      where: { direction: CashFlowDirection.IN, paidAt: null },
      _sum: { amount: true },
    }),
    prisma.cashFlowEntry.aggregate({
      where: { direction: CashFlowDirection.OUT, paidAt: null },
      _sum: { amount: true },
    }),
    prisma.quote.groupBy({
      by: ["status"],
      _count: { id: true },
      where: { deletedAt: null },
    }),
    prisma.quote.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        status: true,
        createdAt: true,
        client: { select: { id: true, name: true } },
      },
    }),
    prisma.project.count({
      where: { status: ProjectStatus.ACTIVE, deletedAt: null },
    }),
    prisma.project.findMany({
      where: { deletedAt: null },
      orderBy: { startedAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        status: true,
        startedAt: true,
        client: { select: { id: true, name: true } },
      },
    }),
    prisma.product.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true, name: true, category: true, unit: true, minimumStock: true },
    }),
    prisma.alert.findMany({
      where: { status: AlertStatus.ACTIVE },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: 10,
      select: { id: true, title: true, priority: true, status: true, createdAt: true },
    }),
  ])

  // Calcular saldo de estoque para alertas
  const entriesByProduct = await prisma.stockEntry.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
  })
  const exitsByProduct = await prisma.stockExit.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
  })
  const activeLoans = await prisma.toolLoan.groupBy({
    by: ["productId"],
    where: { returnedAt: null },
    _sum: { quantity: true },
  })

  const entriesMap = new Map(entriesByProduct.map((e) => [e.productId, Number(e._sum.quantity ?? 0)]))
  const exitsMap = new Map(exitsByProduct.map((e) => [e.productId, Number(e._sum.quantity ?? 0)]))
  const loansMap = new Map(activeLoans.map((l) => [l.productId, Number(l._sum.quantity ?? 0)]))

  const lowStockAlerts = lowStockProducts
    .map((p) => {
      const balance = (entriesMap.get(p.id) ?? 0) - (exitsMap.get(p.id) ?? 0) - (loansMap.get(p.id) ?? 0)
      return { ...p, balance }
    })
    .filter((p) => p.balance <= p.minimumStock)

  const quoteStatusMap = Object.fromEntries(quoteStats.map((s) => [s.status, s._count.id]))

  return {
    financial: {
      monthlyIn: Number(monthlyIn._sum.amount ?? 0),
      monthlyOut: Number(monthlyOut._sum.amount ?? 0),
      monthlyBalance: Number(monthlyIn._sum.amount ?? 0) - Number(monthlyOut._sum.amount ?? 0),
      yearlyIn: Number(yearlyIn._sum.amount ?? 0),
      yearlyOut: Number(yearlyOut._sum.amount ?? 0),
      pendingReceivable: Number(pendingReceivable._sum.amount ?? 0),
      pendingPayable: Number(pendingPayable._sum.amount ?? 0),
    },
    quotes: {
      stats: quoteStatusMap as Partial<Record<QuoteStatus, number>>,
      recent: recentQuotes,
    },
    projects: {
      activeCount: activeProjectsCount,
      recent: recentProjects,
    },
    stock: { lowStockAlerts },
    alerts: openAlerts,
  }
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>
