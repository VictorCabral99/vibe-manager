"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import type { Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { formatCurrency, formatDate } from "@/lib/format"
import {
  markAsPaidAction,
  updateDueDateAction,
} from "@/domains/financeiro/actions"
import {
  markAsPaidSchema,
  updateDueDateSchema,
  type MarkAsPaidInput,
  type UpdateDueDateInput,
} from "@/domains/financeiro/schemas"
import type { CashFlowListItem } from "@/domains/financeiro/queries"
import { CheckCircle, Pencil, Wallet } from "lucide-react"

// ─────────────────────────────────────────────
// Labels
// ─────────────────────────────────────────────

const typeLabels: Record<string, string> = {
  QUOTE_RECEIVABLE: "Orçamento",
  PURCHASE_PAYABLE: "Compra",
  LABOR_PAYABLE: "Mão de Obra",
  EXTERNAL_PAYABLE: "Conta Externa",
  OTHER: "Outro",
}

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  PENDING: { label: "Pendente", variant: "secondary" },
  PAID: { label: "Pago", variant: "default" },
  OVERDUE: { label: "Vencido", variant: "destructive" },
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface CashFlowTableProps {
  entries: CashFlowListItem[]
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function CashFlowTable({ entries }: CashFlowTableProps) {
  const [markPaidId, setMarkPaidId] = useState<string | null>(null)
  const [editDueDateEntry, setEditDueDateEntry] =
    useState<CashFlowListItem | null>(null)
  const [isPending, startTransition] = useTransition()

  const markPaidForm = useForm<MarkAsPaidInput>({
    resolver: zodResolver(markAsPaidSchema) as Resolver<MarkAsPaidInput>,
    defaultValues: { id: "", paidAt: undefined },
  })

  const updateDueDateForm = useForm<UpdateDueDateInput>({
    resolver: zodResolver(updateDueDateSchema) as Resolver<UpdateDueDateInput>,
    defaultValues: { id: "", dueDate: new Date() },
  })

  function openMarkPaid(id: string) {
    setMarkPaidId(id)
    markPaidForm.reset({ id, paidAt: undefined })
  }

  function openEditDueDate(entry: CashFlowListItem) {
    setEditDueDateEntry(entry)
    const due = new Date(entry.dueDate)
    updateDueDateForm.reset({
      id: entry.id,
      dueDate: due,
    })
  }

  function handleMarkPaid() {
    startTransition(async () => {
      const result = await markAsPaidAction(markPaidForm.getValues())
      if (result.success) {
        toast.success("Marcado como pago com sucesso")
        setMarkPaidId(null)
      } else {
        toast.error(result.error ?? "Erro ao marcar como pago")
      }
    })
  }

  function handleUpdateDueDate(data: UpdateDueDateInput) {
    startTransition(async () => {
      const result = await updateDueDateAction(data)
      if (result.success) {
        toast.success("Vencimento atualizado com sucesso")
        setEditDueDateEntry(null)
      } else {
        toast.error(result.error ?? "Erro ao atualizar vencimento")
      }
    })
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title="Nenhum lançamento encontrado"
        description="Não há entradas no fluxo de caixa para este período."
      />
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => {
              const statusInfo = statusConfig[entry.status] ?? statusConfig.PENDING
              const isOverdue =
                entry.status === "PENDING" &&
                new Date(entry.dueDate) < new Date(new Date().setHours(0, 0, 0, 0))

              return (
                <TableRow
                  key={entry.id}
                  className={
                    isOverdue ? "bg-destructive/5 hover:bg-destructive/10" : ""
                  }
                >
                  <TableCell className="font-medium">
                    {entry.description}
                    {entry.quote?.client?.name && (
                      <span className="block text-xs text-muted-foreground">
                        {entry.quote.client.name}
                      </span>
                    )}
                    {entry.purchase?.buyer?.user?.name && (
                      <span className="block text-xs text-muted-foreground">
                        Compra por {entry.purchase.buyer.user.name}
                      </span>
                    )}
                    {entry.laborEntry?.professional?.name && (
                      <span className="block text-xs text-muted-foreground">
                        {entry.laborEntry.professional.name}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {typeLabels[entry.type] ?? entry.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {formatCurrency(entry.amount)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(entry.dueDate)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        isOverdue ? "destructive" : statusInfo.variant
                      }
                    >
                      {isOverdue ? "Vencido" : statusInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {entry.status !== "PAID" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Marcar como pago"
                          onClick={() => openMarkPaid(entry.id)}
                        >
                          <CheckCircle className="size-4 text-green-600" />
                          <span className="sr-only">Marcar como pago</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editar vencimento"
                        onClick={() => openEditDueDate(entry)}
                      >
                        <Pencil className="size-4" />
                        <span className="sr-only">Editar vencimento</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Confirm mark as paid */}
      <ConfirmDialog
        open={!!markPaidId}
        onOpenChange={(open) => !open && setMarkPaidId(null)}
        title="Marcar como pago"
        description="Confirma o recebimento / pagamento desta entrada?"
        confirmLabel="Confirmar pagamento"
        onConfirm={handleMarkPaid}
        loading={isPending}
        variant="default"
      />

      {/* Edit due date dialog */}
      <Dialog
        open={!!editDueDateEntry}
        onOpenChange={(open) => !open && setEditDueDateEntry(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar vencimento</DialogTitle>
          </DialogHeader>

          <Form {...updateDueDateForm}>
            <form
              onSubmit={updateDueDateForm.handleSubmit(handleUpdateDueDate)}
              className="space-y-4"
            >
              <FormField
                control={updateDueDateForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova data de vencimento</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={
                          field.value
                            ? new Date(field.value).toISOString().slice(0, 10)
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDueDateEntry(null)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
