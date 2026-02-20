"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { QuoteStatus } from "@prisma/client"
import { RefreshCw, FolderPlus, Trash2, FileDown } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { formatCurrency } from "@/lib/format"
import {
  changeQuoteStatusAction,
  deleteQuoteAction,
  convertQuoteToProjectAction,
} from "@/domains/comercial/orcamentos/actions"

// ─────────────────────────────────────────────
// Labels e fluxo de status
// ─────────────────────────────────────────────

const STATUS_LABELS: Record<QuoteStatus, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  PAID: "Pago",
  CANCELLED: "Cancelado",
}

const NEXT_STATUSES: Partial<Record<QuoteStatus, QuoteStatus[]>> = {
  PENDING: [QuoteStatus.APPROVED, QuoteStatus.CANCELLED],
  APPROVED: [QuoteStatus.PAID, QuoteStatus.CANCELLED],
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface QuoteDetailActionsProps {
  quote: {
    id: string
    status: QuoteStatus
    hasProject: boolean
  }
  total: number
}

// ─────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────

export function QuoteDetailActions({ quote, total }: QuoteDetailActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Estado: download PDF
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  // Estado: mudança de status
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<QuoteStatus | "">("")
  const [statusNotes, setStatusNotes] = useState("")
  const [changingStatus, setChangingStatus] = useState(false)

  // Estado: converter em projeto
  const [projectDialogOpen, setProjectDialogOpen] = useState(false)
  const [projectName, setProjectName] = useState("")
  const [convertingProject, setConvertingProject] = useState(false)

  // Estado: excluir
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const canChangeStatus = quote.status in NEXT_STATUSES
  const canConvert = quote.status === QuoteStatus.PAID && !quote.hasProject
  const canDelete =
    quote.status === QuoteStatus.PENDING || quote.status === QuoteStatus.CANCELLED

  // ─── Handlers ───

  async function handleStatusChange() {
    if (!selectedStatus) return
    setChangingStatus(true)

    const result = await changeQuoteStatusAction({
      quoteId: quote.id,
      newStatus: selectedStatus as QuoteStatus,
      notes: statusNotes.trim() || undefined,
    })

    setChangingStatus(false)
    setStatusDialogOpen(false)
    setSelectedStatus("")
    setStatusNotes("")

    if (result.success) {
      toast.success("Status atualizado com sucesso")
      startTransition(() => router.refresh())
    } else {
      toast.error(result.error ?? "Erro ao alterar status")
    }
  }

  async function handleConvertToProject() {
    if (!projectName.trim()) {
      toast.error("Informe o nome do projeto")
      return
    }

    setConvertingProject(true)
    const result = await convertQuoteToProjectAction(quote.id, projectName)
    setConvertingProject(false)
    setProjectDialogOpen(false)
    setProjectName("")

    if (result.success && result.data) {
      toast.success("Orçamento convertido em projeto com sucesso!")
      router.push(`/projetos/${result.data.projectId}`)
    } else {
      toast.error(result.error ?? "Erro ao converter em projeto")
    }
  }

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteQuoteAction(quote.id)
    setDeleting(false)
    setDeleteDialogOpen(false)

    if (result.success) {
      toast.success("Orçamento excluído com sucesso")
      router.push("/comercial/orcamentos")
    } else {
      toast.error(result.error ?? "Erro ao excluir orçamento")
    }
  }

  async function handleDownloadPdf() {
    setDownloadingPdf(true)
    try {
      const response = await fetch(`/api/orcamentos/${quote.id}/pdf`)
      if (!response.ok) {
        toast.error("Erro ao gerar PDF")
        return
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `orcamento-${quote.id.slice(-8).toUpperCase()}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error("Erro ao gerar PDF")
    } finally {
      setDownloadingPdf(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-3 justify-end border-t pt-4">
        <Button variant="outline" onClick={handleDownloadPdf} disabled={downloadingPdf}>
          <FileDown className="size-4 mr-2" />
          {downloadingPdf ? "Gerando PDF..." : "Baixar PDF"}
        </Button>

        {canChangeStatus && (
          <Button variant="outline" onClick={() => setStatusDialogOpen(true)}>
            <RefreshCw className="size-4 mr-2" />
            Alterar Status
          </Button>
        )}

        {canConvert && (
          <Button onClick={() => setProjectDialogOpen(true)}>
            <FolderPlus className="size-4 mr-2" />
            Converter em Projeto
          </Button>
        )}

        {canDelete && (
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="size-4 mr-2" />
            Excluir Orçamento
          </Button>
        )}
      </div>

      {/* Dialog: Alterar Status */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Alterar Status do Orçamento</DialogTitle>
            <DialogDescription>
              Selecione o novo status. Esta ação ficará registrada no histórico.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Novo Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(v) => setSelectedStatus(v as QuoteStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {(NEXT_STATUSES[quote.status] ?? []).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStatus === QuoteStatus.PAID && (
              <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm">
                <p className="font-medium text-green-700 dark:text-green-400">
                  Ao marcar como Pago:
                </p>
                <p className="text-green-600 dark:text-green-500 mt-0.5">
                  Uma entrada de {formatCurrency(total)} será criada no fluxo de caixa.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Observações (opcional)</Label>
              <Input
                placeholder="Motivo da mudança de status..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setStatusDialogOpen(false)
                setSelectedStatus("")
                setStatusNotes("")
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

      {/* Dialog: Converter em Projeto */}
      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Converter em Projeto</DialogTitle>
            <DialogDescription>
              Um novo projeto será criado com a receita de{" "}
              <strong>{formatCurrency(total)}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="projectName">Nome do Projeto *</Label>
            <Input
              id="projectName"
              placeholder="Ex: Projeto Cliente XYZ"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleConvertToProject()
                }
              }}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setProjectDialogOpen(false)
                setProjectName("")
              }}
              disabled={convertingProject}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConvertToProject}
              disabled={!projectName.trim() || convertingProject}
            >
              {convertingProject ? "Criando..." : "Criar Projeto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Confirmar Exclusão */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir Orçamento"
        description="Esta ação não pode ser desfeita. O orçamento será removido permanentemente."
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        loading={deleting}
        variant="destructive"
      />
    </>
  )
}
