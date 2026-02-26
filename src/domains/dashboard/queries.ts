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
    cashEntries,
    quoteStats,
    recentQuotes,
    activeProjectsCount,
    recentProjects,
    lowStockProducts,
    openAlerts,
    entriesByProduct,
    exitsByProduct,
    activeLoans,
  ] = await Promise.all([
    // findMany + reduce: evita aggregate() e $queryRaw() que falham com PrismaPg adapter no Prisma 7
    // Filtra apenas entradas do ano corrente (pagas) + pendentes (sem paidAt), reduzindo volume de dados
    prisma.cashFlowEntry.findMany({
      where: {
        OR: [
          { paidAt: { gte: startOfYear } },
          { paidAt: null },
        ],
      },
      select: { direction: true, amount: true, paidAt: true },
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
    prisma.stockEntry.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
    }),
    prisma.stockExit.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
    }),
    prisma.toolLoan.groupBy({
      by: ["productId"],
      where: { returnedAt: null },
      _sum: { quantity: true },
    }),
  ])

  // ── Agregações financeiras em JS (compatível com qualquer adapter) ─────────────
  const sum = (entries: typeof cashEntries) =>
    entries.reduce((acc, e) => acc + Number(e.amount), 0)

  const paid  = cashEntries.filter((e) => e.paidAt !== null)
  const unpaid = cashEntries.filter((e) => e.paidAt === null)

  const monthlyIn  = sum(paid.filter((e) => e.direction === CashFlowDirection.IN  && e.paidAt! >= startOfMonth))
  const monthlyOut = sum(paid.filter((e) => e.direction === CashFlowDirection.OUT && e.paidAt! >= startOfMonth))
  const yearlyIn   = sum(paid.filter((e) => e.direction === CashFlowDirection.IN  && e.paidAt! >= startOfYear))
  const yearlyOut  = sum(paid.filter((e) => e.direction === CashFlowDirection.OUT && e.paidAt! >= startOfYear))
  const pendingReceivable = sum(unpaid.filter((e) => e.direction === CashFlowDirection.IN))
  const pendingPayable    = sum(unpaid.filter((e) => e.direction === CashFlowDirection.OUT))

  // ── Saldo de estoque para alertas ────────────────────────────────────────────
  const entriesMap = new Map(entriesByProduct.map((e) => [e.productId, Number(e._sum.quantity ?? 0)]))
  const exitsMap   = new Map(exitsByProduct.map((e) => [e.productId, Number(e._sum.quantity ?? 0)]))
  const loansMap   = new Map(activeLoans.map((l) => [l.productId, Number(l._sum.quantity ?? 0)]))

  const lowStockAlerts = lowStockProducts
    .map((p) => {
      const balance = (entriesMap.get(p.id) ?? 0) - (exitsMap.get(p.id) ?? 0) - (loansMap.get(p.id) ?? 0)
      return { ...p, balance }
    })
    .filter((p) => p.balance <= p.minimumStock)

  const quoteStatusMap = Object.fromEntries(quoteStats.map((s) => [s.status, s._count.id]))

  return {
    financial: {
      monthlyIn,
      monthlyOut,
      monthlyBalance:    monthlyIn - monthlyOut,
      yearlyIn,
      yearlyOut,
      pendingReceivable,
      pendingPayable,
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
