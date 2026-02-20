"use client"

import { useState } from "react"
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
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { formatCurrency, formatDate } from "@/lib/format"
import { deletePurchaseAction } from "@/domains/compras/actions"
import type { PurchaseListItem } from "@/domains/compras/queries"
import { Trash2 } from "lucide-react"

interface PurchasesTableProps {
  purchases: PurchaseListItem[]
}

export function PurchasesTable({ purchases }: PurchasesTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loadingDelete, setLoadingDelete] = useState(false)

  async function handleDelete() {
    if (!deleteId) return
    setLoadingDelete(true)
    const result = await deletePurchaseAction(deleteId)
    setLoadingDelete(false)

    if (!result.success) {
      toast.error(result.error ?? "Erro ao excluir compra")
      return
    }

    toast.success("Compra excluída com sucesso!")
    setDeleteId(null)
  }

  if (purchases.length === 0) {
    return (
      <EmptyState
        title="Nenhuma compra encontrada"
        description="Registre a primeira compra para começar."
      />
    )
  }

  return (
    <>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Comprador</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Projeto</TableHead>
              <TableHead className="text-right">Valor Total</TableHead>
              <TableHead className="text-right">Itens</TableHead>
              <TableHead className="w-16">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>{formatDate(purchase.date)}</TableCell>
                <TableCell className="font-medium">{purchase.buyer.user.name}</TableCell>
                <TableCell>{purchase.supplier ?? "—"}</TableCell>
                <TableCell>
                  {purchase.project ? (
                    <Badge variant="outline">{purchase.project.name}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(Number(purchase.totalAmount))}
                </TableCell>
                <TableCell className="text-right">{purchase._count.items}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(purchase.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Excluir Compra"
        description="Tem certeza que deseja excluir esta compra? Os lançamentos de estoque e financeiros também serão removidos."
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        loading={loadingDelete}
      />
    </>
  )
}
