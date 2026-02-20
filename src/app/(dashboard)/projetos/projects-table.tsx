"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatPercent } from "@/lib/format"
import { calculateProjectMargin } from "@/domains/projetos/calculations"
import type { ProjectListItem } from "@/domains/projetos/queries"
import { EmptyState } from "@/components/shared/empty-state"
import { Eye } from "lucide-react"

interface ProjectsTableProps {
  projects: ProjectListItem[]
}

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  CLOSED: "Encerrado",
  CANCELLED: "Cancelado",
}

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  CLOSED: "secondary",
  CANCELLED: "destructive",
}

const healthVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  healthy: "default",
  warning: "outline",
  danger: "destructive",
}

const healthLabels: Record<string, string> = {
  healthy: "Saudável",
  warning: "Atenção",
  danger: "Crítico",
}

export function ProjectsTable({ projects }: ProjectsTableProps) {
  if (projects.length === 0) {
    return (
      <EmptyState
        title="Nenhum projeto encontrado"
        description="Crie um novo projeto para começar."
      />
    )
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="text-right">Receita Total</TableHead>
            <TableHead className="text-right">Total Despesas</TableHead>
            <TableHead className="text-right">Margem%</TableHead>
            <TableHead>Saúde</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-16">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => {
            const metrics = calculateProjectMargin({
              totalRevenue: Number(project.totalRevenue),
              targetMargin: Number(project.targetMargin),
              expenses: project.expenses.map((e) => ({ amount: Number(e.amount) })),
              laborEntries: project.laborEntries.map((l) => ({ total: Number(l.total) })),
            })

            return (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>{project.client.name}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(Number(project.totalRevenue))}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(metrics.totalExpenses)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end gap-1">
                    <span>{formatPercent(metrics.marginPercent)}</span>
                    <div className="w-24 bg-muted rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          metrics.health === "healthy"
                            ? "bg-green-500"
                            : metrics.health === "warning"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{
                          width: `${Math.min(metrics.consumptionPercent * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={healthVariants[metrics.health]}>
                    {healthLabels[metrics.health]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariants[project.status]}>
                    {statusLabels[project.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/projetos/${project.id}`}>
                      <Eye className="size-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
