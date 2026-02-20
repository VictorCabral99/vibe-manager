import { prisma } from "@/lib/prisma"
import { ProjectStatus } from "@prisma/client"

// ─────────────────────────────────────────────
// Listagem de projetos
// ─────────────────────────────────────────────

export async function findAllProjects(status?: ProjectStatus) {
  return prisma.project.findMany({
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
  return prisma.laborProfessional.findMany({
    where: { deletedAt: null, isActive: true },
    select: { id: true, name: true, dailyRate: true, phone: true },
    orderBy: { name: "asc" },
  })
}

export type LaborProfessionalItem = Awaited<ReturnType<typeof findActiveLaborProfessionals>>[number]
