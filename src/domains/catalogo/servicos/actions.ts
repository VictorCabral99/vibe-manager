"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import type { ActionResult } from "@/types"
import {
  createServiceSchema,
  updateServiceSchema,
  type CreateServiceInput,
  type UpdateServiceInput,
} from "./schemas"

export async function createServiceAction(
  data: CreateServiceInput
): Promise<ActionResult<{ id: string }>> {
  const parsed = createServiceSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" }
  }

  try {
    const service = await prisma.service.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        basePrice: parsed.data.basePrice ?? null,
        isActive: parsed.data.isActive,
      },
    })
    revalidatePath("/catalogo/servicos")
    return { success: true, data: { id: service.id } }
  } catch {
    return { success: false, error: "Erro ao criar serviço" }
  }
}

export async function updateServiceAction(
  data: UpdateServiceInput
): Promise<ActionResult> {
  const parsed = updateServiceSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" }
  }

  const { id, ...fields } = parsed.data

  try {
    await prisma.service.update({
      where: { id },
      data: {
        ...(fields.name !== undefined && { name: fields.name }),
        ...(fields.description !== undefined && {
          description: fields.description || null,
        }),
        ...(fields.basePrice !== undefined && { basePrice: fields.basePrice ?? null }),
        ...(fields.isActive !== undefined && { isActive: fields.isActive }),
      },
    })
    revalidatePath("/catalogo/servicos")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao atualizar serviço" }
  }
}

export async function toggleServiceActiveAction(
  id: string
): Promise<ActionResult> {
  try {
    const service = await prisma.service.findFirst({
      where: { id, deletedAt: null },
      select: { isActive: true },
    })

    if (!service) {
      return { success: false, error: "Serviço não encontrado" }
    }

    await prisma.service.update({
      where: { id },
      data: { isActive: !service.isActive },
    })

    revalidatePath("/catalogo/servicos")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao alterar status do serviço" }
  }
}

export async function deleteServiceAction(id: string): Promise<ActionResult> {
  try {
    await prisma.service.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    revalidatePath("/catalogo/servicos")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao excluir serviço" }
  }
}
