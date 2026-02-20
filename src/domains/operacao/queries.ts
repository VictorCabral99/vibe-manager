import type { AlertStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"

// ─────────────────────────────────────────────
// Tipos de retorno
// ─────────────────────────────────────────────

export type AlertListItem = Awaited<ReturnType<typeof findAllAlerts>>[number]
export type AlertDetail = Awaited<ReturnType<typeof findAlertById>>

// ─────────────────────────────────────────────
// findAllAlerts
// ─────────────────────────────────────────────

export async function findAllAlerts(status?: AlertStatus) {
  return prisma.alert.findMany({
    where: {
      ...(status !== undefined && { status }),
    },
    include: {
      project: {
        select: { id: true, name: true },
      },
      product: {
        select: { id: true, name: true },
      },
      assignedTo: {
        select: { id: true, name: true },
      },
      createdBy: {
        select: { id: true, name: true },
      },
    },
    orderBy: [
      {
        priority: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  })
}

// ─────────────────────────────────────────────
// findActiveAlerts
// ─────────────────────────────────────────────

export async function findActiveAlerts() {
  return findAllAlerts("ACTIVE")
}

// ─────────────────────────────────────────────
// findAlertById
// ─────────────────────────────────────────────

export async function findAlertById(id: string) {
  return prisma.alert.findFirst({
    where: { id },
    include: {
      project: {
        select: { id: true, name: true },
      },
      product: {
        select: { id: true, name: true },
      },
      assignedTo: {
        select: { id: true, name: true },
      },
      createdBy: {
        select: { id: true, name: true },
      },
    },
  })
}
