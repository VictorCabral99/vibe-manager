"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { formatDate } from "@/lib/format"
import {
  resolveAlertAction,
  deleteAlertAction,
} from "@/domains/operacao/actions"
import type { AlertListItem } from "@/domains/operacao/queries"
import {
  MoreHorizontal,
  CheckCircle2,
  Trash2,
  Bell,
  ShieldAlert,
} from "lucide-react"
import Link from "next/link"

// ─────────────────────────────────────────────
// Labels e estilos de prioridade
// ─────────────────────────────────────────────

type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"

const priorityConfig: Record<
  Priority,
  {
    label: string
    badgeClass: string
    rowClass: string
    pulse: boolean
  }
> = {
  CRITICAL: {
    label: "Crítico",
    badgeClass: "bg-red-600 text-white hover:bg-red-700",
    rowClass: "border-l-4 border-l-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50",
    pulse: true,
  },
  HIGH: {
    label: "Alto",
    badgeClass: "bg-orange-500 text-white hover:bg-orange-600",
    rowClass: "border-l-4 border-l-orange-500 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20 dark:hover:bg-orange-950/40",
    pulse: true,
  },
  MEDIUM: {
    label: "Médio",
    badgeClass: "bg-yellow-500 text-white hover:bg-yellow-600",
    rowClass: "",
    pulse: false,
  },
  LOW: {
    label: "Baixo",
    badgeClass: "bg-slate-400 text-white hover:bg-slate-500",
    rowClass: "",
    pulse: false,
  },
}

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  ACTIVE: { label: "Ativo", variant: "secondary" },
  RESOLVED: { label: "Resolvido", variant: "outline" },
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

interface AlertsTableProps {
  alerts: AlertListItem[]
  showResolveAction?: boolean
}

export function AlertsTable({
  alerts,
  showResolveAction = true,
}: AlertsTableProps) {
  const [resolveId, setResolveId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  async function handleResolve() {
    if (!resolveId) return
    setLoadingId(resolveId)
    const result = await resolveAlertAction({ id: resolveId })
    setLoadingId(null)
    setResolveId(null)
    if (result.success) {
      toast.success("Alerta resolvido com sucesso")
    } else {
      toast.error(result.error ?? "Erro ao resolver alerta")
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setLoadingId(deleteId)
    startTransition(async () => {
      const result = await deleteAlertAction(deleteId)
      setLoadingId(null)
      setDeleteId(null)
      if (result.success) {
        toast.success("Alerta excluído com sucesso")
      } else {
        toast.error(result.error ?? "Erro ao excluir alerta")
      }
    })
  }

  if (alerts.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="Nenhum alerta encontrado"
        description="Não há alertas nesta categoria."
      />
    )
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Projeto</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="w-[60px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert) => {
              const config = priorityConfig[alert.priority as Priority]

              return (
                <TableRow key={alert.id} className={config.rowClass}>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      {config.pulse && (
                        <span className="relative flex size-2 mt-1.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full size-2 bg-red-500" />
                        </span>
                      )}
                      <div>
                        <p className="font-medium leading-tight">{alert.title}</p>
                        {alert.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {alert.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={config.badgeClass}>{config.label}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {alert.project?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {alert.product?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {alert.assignedTo?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[alert.status]?.variant ?? "secondary"}>
                      {statusConfig[alert.status]?.label ?? alert.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(alert.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={loadingId === alert.id}
                        >
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/operacao/${alert.id}/editar`}>
                            <ShieldAlert className="size-4 mr-2" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        {showResolveAction && alert.status === "ACTIVE" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setResolveId(alert.id)}
                            >
                              <CheckCircle2 className="size-4 mr-2 text-green-600" />
                              Resolver
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(alert.id)}
                        >
                          <Trash2 className="size-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Confirm resolve */}
      <ConfirmDialog
        open={!!resolveId}
        onOpenChange={(open) => !open && setResolveId(null)}
        title="Resolver alerta"
        description="Confirma a resolução deste alerta? Ele será marcado como resolvido."
        confirmLabel="Resolver"
        onConfirm={handleResolve}
        loading={loadingId === resolveId}
        variant="default"
      />

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Excluir alerta"
        description="Tem certeza que deseja excluir este alerta? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        loading={loadingId === deleteId}
        variant="destructive"
      />
    </>
  )
}
