"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { ActionResult } from "@/types"
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
} from "./schemas"

// ─────────────────────────────────────────────
// Actions de Funcionários
// ─────────────────────────────────────────────

export async function createEmployeeAction(
  data: CreateEmployeeInput
): Promise<ActionResult<{ id: string }>> {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: "Não autorizado" }
  }

  const parsed = createEmployeeSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  try {
    const { userId, name, cpf, phone, jobTitle, canPurchase, canWithdrawStock, notes } =
      parsed.data

    const user = await prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    })
    if (!user) {
      return { success: false, error: "Usuário não encontrado" }
    }

    const existingEmployee = await prisma.employee.findFirst({
      where: { userId, deletedAt: null },
    })
    if (existingEmployee) {
      return { success: false, error: "Este usuário já possui um funcionário vinculado" }
    }

    if (cpf) {
      const existingCpf = await prisma.employee.findFirst({
        where: { cpf, deletedAt: null },
      })
      if (existingCpf) {
        return { success: false, error: "CPF já cadastrado" }
      }
    }

    const employee = await prisma.employee.create({
      data: {
        userId,
        name,
        cpf: cpf || null,
        phone: phone || null,
        jobTitle,
        canPurchase,
        canWithdrawStock,
        notes: notes || null,
      },
    })

    revalidatePath("/pessoas/funcionarios")
    return { success: true, data: { id: employee.id } }
  } catch {
    return { success: false, error: "Erro ao criar funcionário" }
  }
}

export async function updateEmployeeAction(data: UpdateEmployeeInput): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: "Não autorizado" }
  }

  const parsed = updateEmployeeSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" }
  }

  try {
    const { id, cpf, phone, notes, ...rest } = parsed.data

    const employee = await prisma.employee.findFirst({
      where: { id, deletedAt: null },
    })
    if (!employee) {
      return { success: false, error: "Funcionário não encontrado" }
    }

    if (cpf && cpf !== employee.cpf) {
      const existingCpf = await prisma.employee.findFirst({
        where: { cpf, deletedAt: null, NOT: { id } },
      })
      if (existingCpf) {
        return { success: false, error: "CPF já cadastrado" }
      }
    }

    await prisma.employee.update({
      where: { id },
      data: {
        ...rest,
        cpf: cpf || null,
        phone: phone || null,
        notes: notes || null,
      },
    })

    revalidatePath("/pessoas/funcionarios")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao atualizar funcionário" }
  }
}

export async function toggleEmployeeActiveAction(id: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: "Não autorizado" }
  }

  try {
    const employee = await prisma.employee.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, isActive: true },
    })
    if (!employee) {
      return { success: false, error: "Funcionário não encontrado" }
    }

    await prisma.employee.update({
      where: { id },
      data: { isActive: !employee.isActive },
    })

    revalidatePath("/pessoas/funcionarios")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao alterar status do funcionário" }
  }
}

export async function deleteEmployeeAction(id: string): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: "Não autorizado" }
  }

  try {
    const employee = await prisma.employee.findFirst({
      where: { id, deletedAt: null },
    })
    if (!employee) {
      return { success: false, error: "Funcionário não encontrado" }
    }

    await prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    revalidatePath("/pessoas/funcionarios")
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao excluir funcionário" }
  }
}
