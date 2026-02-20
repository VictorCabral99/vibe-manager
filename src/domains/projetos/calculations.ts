// ─────────────────────────────────────────────
// Cálculos de margem e saúde do projeto
// ─────────────────────────────────────────────

export type ProjectHealth = "healthy" | "warning" | "danger"

export interface ProjectMetrics {
  totalExpenses: number
  margin: number
  marginPercent: number
  consumptionPercent: number
  health: ProjectHealth
}

export function calculateProjectMargin(project: {
  totalRevenue: number
  targetMargin: number
  expenses: { amount: number }[]
  laborEntries: { total: number }[]
}): ProjectMetrics {
  const expensesTotal = project.expenses.reduce((sum, e) => sum + e.amount, 0)
  const laborTotal = project.laborEntries.reduce((sum, l) => sum + l.total, 0)
  const totalExpenses = expensesTotal + laborTotal

  const totalRevenue = project.totalRevenue
  const margin = totalRevenue - totalExpenses
  const marginPercent = totalRevenue > 0 ? margin / totalRevenue : 0
  const consumptionPercent = totalRevenue > 0 ? totalExpenses / totalRevenue : 0

  const targetMargin = project.targetMargin
  let health: ProjectHealth

  if (consumptionPercent < targetMargin * 0.8) {
    health = "healthy"
  } else if (consumptionPercent < targetMargin) {
    health = "warning"
  } else {
    health = "danger"
  }

  return {
    totalExpenses,
    margin,
    marginPercent,
    consumptionPercent,
    health,
  }
}
