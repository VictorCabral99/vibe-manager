"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import type { ActionResult } from "@/types"
import {
  createClientSchema,
  updateClientSchema,
  type CreateClientInput,
  type UpdateClientInput,
} from "./schemas"

export async function createClientAction(
  data: CreateClientInput
): Promise<ActionResult<{ id: string }>> {
  const parsed = createClientSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" }
  }

  try {
    const client = await prisma.client.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        document: parsed.data.document || null,
        address: parsed.data.address || null,
        notes: parsed.data.notes || null,
      },
    })
    revalidatePath("/pessoas/clientes")
    return { success: true, data: { id: client.id } }
  } catch {
    return { success: false, error: "Erro ao criar cliente" }
  }
}

export async function updateClientAction(
  data: UpdateClientInput
): Promise<ActionResult> {
  const parsed = updateClientSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" }
  }

  const { id, ...fields } = parsed.data

  try {
    await prisma.client.update({
      where: { id },
      data: {
        ...(fields.name !== undefined && { name: fields.name }),
        ...(fields.email !== undefined && { email: fields.email || null }),
        ...(fields.phone !== undefined && { phone: fields.phone || null }),
        ...(fields.document !== undefined && { document: fields.document || null }),
        ...(fields.address !== undefined && { address: fields.address || null }),
        ...(fields.notes !== undefined && { notes: fields.notes || null }),
      },
    })
    revalidatePath("/pessoas/clientes")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao atualizar cliente" }
  }
}

export async function toggleClientActiveAction(
  id: string
): Promise<ActionResult> {
  try {
    const client = await prisma.client.findFirst({
      where: { id, deletedAt: null },
      select: { isActive: true },
    })

    if (!client) {
      return { success: false, error: "Cliente não encontrado" }
    }

    await prisma.client.update({
      where: { id },
      data: { isActive: !client.isActive },
    })

    revalidatePath("/pessoas/clientes")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao alterar status do cliente" }
  }
}

export async function deleteClientAction(id: string): Promise<ActionResult> {
  try {
    await prisma.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    revalidatePath("/pessoas/clientes")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao excluir cliente" }
  }
}
