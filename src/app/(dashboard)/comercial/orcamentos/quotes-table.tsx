"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { QuoteStatus } from "@prisma/client"
import { Eye, Pencil, Trash2, RefreshCw, AlertCircle } from "lucide-react"
import { toast } from "sonner"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { formatDate } from "@/lib/format"
import { isQuoteOverdue } from "@/domains/comercial/orcamentos/calculations"
import {
  deleteQuoteAction,
  changeQuoteStatusAction,
} from "@/domains/comercial/orcamentos/actions"
import type { QuoteListItem } from "@/domains/comercial/orcamentos/queries"

// ─────────────────────────────────────────────
// Helpers de exibição
// ─────────────────────────────────────────────

const STATUS_LABELS: Record<QuoteStatus, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  PAID: "Pago",
  CANCELLED: "Cancelado",
}

function StatusBadge({ status }: { status: QuoteStatus }) {
  const variants: Record<QuoteStatus, string> = {
    PENDING:
      "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400",
    APPROVED:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
    PAID: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400",
    CANCELLED:
      "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${variants[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

const NEXT_STATUSES: Partial<Record<QuoteStatus, QuoteStatus[]>> = {
  PENDING: [QuoteStatus.APPROVED, QuoteStatus.CANCELLED],
  APPROVED: [QuoteStatus.PAID, QuoteStatus.CANCELLED],
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

interface QuotesTableProps {
  quotes: QuoteListItem[]
}

export function QuotesTable({ quotes }: QuotesTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Estado para confirm de exclusão
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Estado para mudança de status
  const [statusDialogQuote, setStatusDialogQuote] = useState<QuoteListItem | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<QuoteStatus | "">("")
  const [changingStatus, setChangingStatus] = useState(false)

  if (quotes.length === 0) {
    return (
      <EmptyState
        title="Nenhum orçamento encontrado"
        description="Clique em 'Novo Orçamento' para criar o primeiro."
      />
    )
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    const result = await deleteQuoteAction(deleteId)
    setDeleting(false)
    setDeleteId(null)
    if (result.success) {
      toast.success("Orçamento excluído com sucesso")
      startTransition(() => router.refresh())
    } else {
      toast.error(result.error ?? "Erro ao excluir orçamento")
    }
  }

  async function handleStatusChange() {
    if (!statusDialogQuote || !selectedStatus) return
    setChangingStatus(true)
    const result = await changeQuoteStatusAction({
      quoteId: statusDialogQuote.id,
      newStatus: selectedStatus as QuoteStatus,
    })
    setChangingStatus(false)
    setStatusDialogQuote(null)
    setSelectedStatus("")
    if (result.success) {
      toast.success("Status atualizado com sucesso")
      startTransition(() => router.refresh())
    } else {
      toast.error(result.error ?? "Erro ao alterar status")
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-center">Itens</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">+30 dias</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((quote) => {
              const overdue = isQuoteOverdue(quote.createdAt, quote.status)
              const totalItems = quote._count.items + quote._count.services
              const canChangeStatus = quote.status in NEXT_STATUSES
              const canDelete =
                quote.status === QuoteStatus.PENDING ||
                quote.status === QuoteStatus.CANCELLED

              return (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.client.name}</TableCell>
                  <TableCell className="text-center">
                    <span className="text-muted-foreground text-sm">{totalItems}</span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={quote.status} />
                  </TableCell>
                  <TableCell className="text-center">
                    {overdue ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="size-3" />
                        Atrasado
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(quote.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/comercial/orcamentos/${quote.id}`}>
                          <Eye className="size-4" />
                          <span className="sr-only">Ver</span>
                        </Link>
                      </Button>

                      {quote.status === QuoteStatus.PENDING && (
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/comercial/orcamentos/${quote.id}/editar`}>
                            <Pencil className="size-4" />
                            <span className="sr-only">Editar</span>
                          </Link>
                        </Button>
                      )}

                      {canChangeStatus && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setStatusDialogQuote(quote)
                            setSelectedStatus("")
                          }}
                        >
                          <RefreshCw className="size-4" />
                          <span className="sr-only">Alterar Status</span>
                        </Button>
                      )}

                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(quote.id)}
                        >
                          <Trash2 className="size-4" />
                          <span className="sr-only">Excluir</span>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Excluir Orçamento"
        description="Esta ação não pode ser desfeita. O orçamento será removido permanentemente."
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        loading={deleting}
        variant="destructive"
      />

      {/* Dialog de mudança de status */}
      <Dialog
        open={!!statusDialogQuote}
        onOpenChange={(open) => {
          if (!open) {
            setStatusDialogQuote(null)
            setSelectedStatus("")
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Alterar Status</DialogTitle>
            <DialogDescription>
              Selecione o novo status para o orçamento de{" "}
              <strong>{statusDialogQuote?.client.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <Select
            value={selectedStatus}
            onValueChange={(v) => setSelectedStatus(v as QuoteStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o novo status..." />
            </SelectTrigger>
            <SelectContent>
              {statusDialogQuote &&
                (NEXT_STATUSES[statusDialogQuote.status] ?? []).map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setStatusDialogQuote(null)
                setSelectedStatus("")
              }}
              disabled={changingStatus}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={!selectedStatus || changingStatus}
            >
              {changingStatus ? "Salvando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
