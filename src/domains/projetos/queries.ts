import { prisma } from "@/lib/prisma"
import { ProjectStatus } from "@prisma/client"

// ─────────────────────────────────────────────
// Listagem de projetos
// ─────────────────────────────────────────────

export async function findAllProjects(status?: ProjectStatus) {
  const rows = await prisma.project.findMany({
    where: {
      deletedAt: null,
      ...(status ? { status } : {}),
    },
    select: {
      id: true,
      name: true,
      status: true,
      totalRevenue: true,
      targetMargin: true,
      startedAt: true,
      closedAt: true,
      createdAt: true,
      client: {
        select: { id: true, name: true },
      },
      _count: {
        select: {
          expenses: true,
          laborEntries: true,
        },
      },
      expenses: {
        select: { amount: true },
      },
      laborEntries: {
        select: { total: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Converte Decimal → number para compatibilidade com Client Components
  return rows.map((r) => ({
    ...r,
    totalRevenue:  r.totalRevenue.toNumber(),
    targetMargin:  r.targetMargin.toNumber(),
    expenses:      r.expenses.map((e) => ({ amount: e.amount.toNumber() })),
    laborEntries:  r.laborEntries.map((l) => ({ total: l.total.toNumber() })),
  }))
}

export type ProjectListItem = Awaited<ReturnType<typeof findAllProjects>>[number]

// ─────────────────────────────────────────────
// Detalhe de projeto
// ─────────────────────────────────────────────

export async function findProjectById(id: string) {
  return prisma.project.findFirst({
    where: { id, deletedAt: null },
    include: {
      client: true,
      expenses: {
        include: {
          registeredBy: { select: { id: true, name: true } },
        },
        orderBy: { date: "desc" },
      },
      laborEntries: {
        include: {
          professional: true,
          registeredBy: { select: { id: true, name: true } },
        },
        orderBy: { date: "desc" },
      },
      stockExits: {
        include: {
          product: { select: { id: true, name: true, unit: true } },
          registeredBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      purchases: {
        include: {
          buyer: {
            include: { user: { select: { id: true, name: true } } },
          },
          items: {
            include: {
              product: { select: { id: true, name: true, unit: true } },
            },
          },
        },
        orderBy: { date: "desc" },
      },
      createdBy: { select: { id: true, name: true } },
    },
  })
}

export type ProjectDetail = Awaited<ReturnType<typeof findProjectById>>

// ─────────────────────────────────────────────
// Projetos ativos (para selects)
// ─────────────────────────────────────────────

export async function findActiveProjects() {
  return prisma.project.findMany({
    where: { deletedAt: null, status: ProjectStatus.ACTIVE },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
}

// ─────────────────────────────────────────────
// Profissionais ativos
// ─────────────────────────────────────────────

export async function findActiveLaborProfessionals() {
  const rows = await prisma.laborProfessional.findMany({
    where: { deletedAt: null, isActive: true },
    select: { id: true, name: true, dailyRate: true, phone: true },
    orderBy: { name: "asc" },
  })
  return rows.map((r) => ({ ...r, dailyRate: r.dailyRate.toNumber() }))
}

export type LaborProfessionalItem = Awaited<ReturnType<typeof findActiveLaborProfessionals>>[number]
