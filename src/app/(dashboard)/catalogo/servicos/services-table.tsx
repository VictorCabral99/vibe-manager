"use client"

import { useState } from "react"
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
import { formatCurrency } from "@/lib/format"
import { toggleServiceActiveAction, deleteServiceAction } from "@/domains/catalogo/servicos/actions"
import type { ServiceListItem } from "@/domains/catalogo/servicos/queries"
import { MoreHorizontal, Pencil, Trash2, ToggleLeft, Wrench } from "lucide-react"
import Link from "next/link"

interface ServicesTableProps {
  services: ServiceListItem[]
}

export function ServicesTable({ services }: ServicesTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleToggleActive(id: string) {
    setLoadingId(id)
    const result = await toggleServiceActiveAction(id)
    setLoadingId(null)
    if (result.success) {
      toast.success("Status atualizado com sucesso")
    } else {
      toast.error(result.error ?? "Erro ao alterar status")
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setLoadingId(deleteId)
    const result = await deleteServiceAction(deleteId)
    setLoadingId(null)
    setDeleteId(null)
    if (result.success) {
      toast.success("Serviço excluído com sucesso")
    } else {
      toast.error(result.error ?? "Erro ao excluir serviço")
    }
  }

  if (services.length === 0) {
    return (
      <EmptyState
        icon={Wrench}
        title="Nenhum serviço encontrado"
        description="Cadastre o primeiro serviço para começar."
      />
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor Base</TableHead>
              <TableHead className="text-center">Ativo</TableHead>
              <TableHead className="w-[60px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell className="text-muted-foreground max-w-xs">
                  {service.description ? (
                    <span className="truncate block">{service.description}</span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {service.basePrice !== null
                    ? formatCurrency(service.basePrice.toString())
                    : <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="text-center">
                  {service.isActive ? (
                    <Badge variant="default">Ativo</Badge>
                  ) : (
                    <Badge variant="outline">Inativo</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={loadingId === service.id}
                      >
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/catalogo/servicos/${service.id}/editar`}>
                          <Pencil className="size-4 mr-2" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleToggleActive(service.id)}
                      >
                        <ToggleLeft className="size-4 mr-2" />
                        {service.isActive ? "Desativar" : "Ativar"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(service.id)}
                      >
                        <Trash2 className="size-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Excluir serviço"
        description="Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        loading={loadingId === deleteId}
        variant="destructive"
      />
    </>
  )
}
