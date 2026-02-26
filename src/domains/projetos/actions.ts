"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requirePermission } from "@/lib/auth-action"
import { PERMISSIONS } from "@/domains/auth/permissions"
import { createAuditLog } from "@/lib/audit"
import type { ActionResult } from "@/types"
import {
  createProjectSchema,
  updateProjectSchema,
  createExpenseSchema,
  createLaborProfessionalSchema,
  createLaborEntrySchema,
  type CreateProjectInput,
  type UpdateProjectInput,
  type CreateExpenseInput,
  type CreateLaborProfessionalInput,
  type CreateLaborEntryInput,
} from "./schemas"
import { ProjectStatus, ExpenseType, CashFlowType, CashFlowDirection } from "@prisma/client"

// ─────────────────────────────────────────────
// Projeto
// ─────────────────────────────────────────────

export async function createProjectAction(
  data: CreateProjectInput
): Promise<ActionResult<{ id: string }>> {
  const guard = await requirePermission(PERMISSIONS.projects.create)
  if (!guard.user) return guard.error

  const parsed = createProjectSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos: " + parsed.error.issues[0].message }
  }

  try {
    const project = await prisma.project.create({
      data: {
        name: parsed.data.name,
        clientId: parsed.data.clientId,
        totalRevenue: parsed.data.totalRevenue,
        targetMargin: parsed.data.targetMargin,
        notes: parsed.data.notes ?? null,
        createdById: guard.user.id,
      },
    })

    void createAuditLog({ userId: guard.user.id, action: "CREATE", entity: "Project", entityId: project.id }).catch(console.error)
    revalidatePath("/projetos")
    return { success: true, data: { id: project.id } }
  } catch {
    return { success: false, error: "Erro ao criar projeto" }
  }
}

export async function updateProjectAction(
  data: UpdateProjectInput
): Promise<ActionResult> {
  const guard = await requirePermission(PERMISSIONS.projects.edit)
  if (!guard.user) return guard.error

  const parsed = updateProjectSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos: " + parsed.error.issues[0].message }
  }

  const { id, ...fields } = parsed.data

  try {
    const project = await prisma.project.findFirst({
      where: { id, deletedAt: null },
      select: { status: true },
    })

    if (!project) return { success: false, error: "Projeto não encontrado" }
    if (project.status !== ProjectStatus.ACTIVE) {
      return { success: false, error: "Somente projetos ativos podem ser editados" }
    }

    await prisma.project.update({
      where: { id },
      data: {
        ...(fields.name !== undefined && { name: fields.name }),
        ...(fields.clientId !== undefined && { clientId: fields.clientId }),
        ...(fields.totalRevenue !== undefined && { totalRevenue: fields.totalRevenue }),
        ...(fields.targetMargin !== undefined && { targetMargin: fields.targetMargin }),
        ...(fields.notes !== undefined && { notes: fields.notes ?? null }),
      },
    })

    void createAuditLog({ userId: guard.user.id, action: "UPDATE", entity: "Project", entityId: id }).catch(console.error)
    revalidatePath("/projetos")
    revalidatePath(`/projetos/${id}`)
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao atualizar projeto" }
  }
}

export async function closeProjectAction(id: string): Promise<ActionResult> {
  const guard = await requirePermission(PERMISSIONS.projects.close)
  if (!guard.user) return guard.error

  try {
    const project = await prisma.project.findFirst({
      where: { id, deletedAt: null },
      select: { status: true },
    })

    if (!project) return { success: false, error: "Projeto não encontrado" }
    if (project.status !== ProjectStatus.ACTIVE) {
      return { success: false, error: "Projeto já está encerrado ou cancelado" }
    }

    await prisma.project.update({
      where: { id },
      data: {
        status: ProjectStatus.CLOSED,
        closedAt: new Date(),
      },
    })

    void createAuditLog({ userId: guard.user.id, action: "CLOSE", entity: "Project", entityId: id }).catch(console.error)
    revalidatePath("/projetos")
    revalidatePath(`/projetos/${id}`)
    return { success: true }
  } catch {
    return { success: false, error: "Erro ao encerrar projeto" }
  }
}

// ─────────────────────────────────────────────
// Despesa
// ─────────────────────────────────────────────

export async function createExpenseAction(
  data: CreateExpenseInput
): Promise<ActionResult<{ id: string }>> {
  const guard = await requirePermission(PERMISSIONS.projects.edit)
  if (!guard.user) return guard.error

  const parsed = createExpenseSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos: " + parsed.error.issues[0].message }
  }

  try {
    const expense = await prisma.projectExpense.create({
      data: {
        projectId: parsed.data.projectId,
        type: parsed.data.type,
        description: parsed.data.description,
        amount: parsed.data.amount,
        date: parsed.data.date,
        registeredById: guard.user.id,
      },
    })

    void createAuditLog({ userId: guard.user.id, action: "CREATE", entity: "ProjectExpense", entityId: expense.id }).catch(console.error)
    revalidatePath("/projetos")
    revalidatePath(`/projetos/${parsed.data.projectId}`)
    return { success: true, data: { id: expense.id } }
  } catch {
    return { success: false, error: "Erro ao registrar despesa" }
  }
}

// ─────────────────────────────────────────────
// Profissional de Mão de Obra
// ─────────────────────────────────────────────

export async function createLaborProfessionalAction(
  data: CreateLaborProfessionalInput
): Promise<ActionResult<{ id: string }>> {
  const guard = await requirePermission(PERMISSIONS.projects.edit)
  if (!guard.user) return guard.error

  const parsed = createLaborProfessionalSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos: " + parsed.error.issues[0].message }
  }

  try {
    const professional = await prisma.laborProfessional.create({
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone ?? null,
        dailyRate: parsed.data.dailyRate,
      },
    })

    void createAuditLog({ userId: guard.user.id, action: "CREATE", entity: "LaborProfessional", entityId: professional.id }).catch(console.error)
    revalidatePath("/projetos")
    return { success: true, data: { id: professional.id } }
  } catch {
    return { success: false, error: "Erro ao cadastrar profissional" }
  }
}

// ─────────────────────────────────────────────
// Lançamento de Mão de Obra
// ─────────────────────────────────────────────

export async function createLaborEntryAction(
  data: CreateLaborEntryInput
): Promise<ActionResult<{ id: string }>> {
  const guard = await requirePermission(PERMISSIONS.projects.edit)
  if (!guard.user) return guard.error

  const parsed = createLaborEntrySchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Dados inválidos: " + parsed.error.issues[0].message }
  }

  try {
    const professional = await prisma.laborProfessional.findFirst({
      where: { id: parsed.data.professionalId, deletedAt: null },
      select: { dailyRate: true, name: true },
    })

    if (!professional) return { success: false, error: "Profissional não encontrado" }

    const dailyRate = Number(professional.dailyRate)
    const quantity = parsed.data.quantity
    const total = dailyRate * quantity

    const entry = await prisma.$transaction(async (tx) => {
      const laborEntry = await tx.laborEntry.create({
        data: {
          professionalId: parsed.data.professionalId,
          projectId: parsed.data.projectId,
          date: parsed.data.date,
          dailyRate,
          quantity,
          total,
          description: parsed.data.description ?? null,
          registeredById: guard.user.id,
        },
      })

      await tx.projectExpense.create({
        data: {
          projectId: parsed.data.projectId,
          type: ExpenseType.LABOR,
          description: `Diária - ${professional.name}${parsed.data.description ? ` - ${parsed.data.description}` : ""}`,
          amount: total,
          date: parsed.data.date,
          registeredById: guard.user.id,
        },
      })

      await tx.cashFlowEntry.create({
        data: {
          type: CashFlowType.LABOR_PAYABLE,
          direction: CashFlowDirection.OUT,
          description: `Mão de obra - ${professional.name}`,
          amount: total,
          dueDate: parsed.data.date,
          laborEntryId: laborEntry.id,
          createdById: guard.user.id,
        },
      })

      return laborEntry
    })

    void createAuditLog({ userId: guard.user.id, action: "CREATE", entity: "LaborEntry", entityId: entry.id }).catch(console.error)
    revalidatePath("/projetos")
    revalidatePath(`/projetos/${parsed.data.projectId}`)
    return { success: true, data: { id: entry.id } }
  } catch {
    return { success: false, error: "Erro ao registrar lançamento de mão de obra" }
  }
}
