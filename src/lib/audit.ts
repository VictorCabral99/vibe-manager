"use server"

import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

interface AuditParams {
  userId: string
  action: string
  entity: string
  entityId?: string
  oldData?: Record<string, unknown>
  newData?: Record<string, unknown>
}

export async function createAuditLog({
  userId,
  action,
  entity,
  entityId,
  oldData,
  newData,
}: AuditParams) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      oldData: oldData as Prisma.InputJsonValue | undefined,
      newData: newData as Prisma.InputJsonValue | undefined,
    },
  })
}
