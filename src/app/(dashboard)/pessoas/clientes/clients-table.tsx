"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { formatDocument } from "@/lib/format"
import { toggleClientActiveAction, deleteClientAction } from "@/domains/pessoas/clientes/actions"
import type { ClientListItem } from "@/domains/pessoas/clientes/queries"
import { MoreHorizontal, Eye, Pencil, Trash2, ToggleLeft, Users } from "lucide-react"
import Link from "next/link"

interface ClientsTableProps {
  clients: ClientListItem[]
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleToggleActive(id: string) {
    setLoadingId(id)
    const result = await toggleClientActiveAction(id)
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
    const result = await deleteClientAction(deleteId)
    setLoadingId(null)
    setDeleteId(null)
    if (result.success) {
      toast.success("Cliente excluído com sucesso")
    } else {
      toast.error(result.error ?? "Erro ao excluir cliente")
    }
  }

  if (clients.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum cliente encontrado"
        description="Cadastre o primeiro cliente para começar."
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
              <TableHead>Documento</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead className="text-center">Orçamentos</TableHead>
              <TableHead className="text-center">Projetos</TableHead>
              <TableHead className="text-center">Ativo</TableHead>
              <TableHead className="w-[60px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {client.document ? formatDocument(client.document) : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {client.phone ?? "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {client.email ?? "—"}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">{client._count.quotes}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">{client._count.projects}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  {client.isActive ? (
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
                        disabled={loadingId === client.id}
                      >
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/pessoas/clientes/${client.id}`}>
                          <Eye className="size-4 mr-2" />
                          Ver detalhes
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/pessoas/clientes/${client.id}/editar`}>
                          <Pencil className="size-4 mr-2" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleToggleActive(client.id)}
                      >
                        <ToggleLeft className="size-4 mr-2" />
                        {client.isActive ? "Desativar" : "Ativar"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(client.id)}
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
        title="Excluir cliente"
        description="Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        loading={loadingId === deleteId}
        variant="destructive"
      />
    </>
  )
}
