"use client"

import { useState, useTransition } from "react"
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
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { formatDateTime } from "@/lib/format"
import {
  toggleUserActiveAction,
  deleteUserAction,
} from "@/domains/pessoas/usuarios/actions"
import type { UserListItem } from "@/domains/pessoas/usuarios/queries"
import type { Role } from "@prisma/client"
import { Pencil, Trash2, Users } from "lucide-react"
import { UserForm } from "./user-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface UsersTableProps {
  users: UserListItem[]
}

const roleBadgeVariant: Record<Role, "destructive" | "default" | "secondary" | "outline"> = {
  ADMIN: "destructive",
  MANAGER: "default",
  EMPLOYEE: "secondary",
  VIEWER: "outline",
}

const roleLabel: Record<Role, string> = {
  ADMIN: "Admin",
  MANAGER: "Gerente",
  EMPLOYEE: "Funcionário",
  VIEWER: "Visualizador",
}

export function UsersTable({ users }: UsersTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editUser, setEditUser] = useState<UserListItem | null>(null)
  const [loadingToggleId, setLoadingToggleId] = useState<string | null>(null)

  function handleToggleActive(id: string) {
    setLoadingToggleId(id)
    startTransition(async () => {
      const result = await toggleUserActiveAction(id)
      if (result.success) {
        toast.success("Status atualizado com sucesso")
        router.refresh()
      } else {
        toast.error(result.error ?? "Erro ao atualizar status")
      }
      setLoadingToggleId(null)
    })
  }

  function handleDelete() {
    if (!deleteId) return
    startTransition(async () => {
      const result = await deleteUserAction(deleteId)
      if (result.success) {
        toast.success("Usuário excluído com sucesso")
        setDeleteId(null)
        router.refresh()
      } else {
        toast.error(result.error ?? "Erro ao excluir usuário")
      }
    })
  }

  if (users.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum usuário encontrado"
        description="Crie o primeiro usuário para começar."
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
              <TableHead>E-mail</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Funcionário vinculado</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead>Último acesso</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={roleBadgeVariant[user.role]}>
                    {roleLabel[user.role]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.employee ? (
                    <span className="text-sm">
                      {user.employee.name}{" "}
                      <span className="text-muted-foreground">
                        — {user.employee.jobTitle}
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(user.id)}
                    disabled={loadingToggleId === user.id || isPending}
                    className="p-0 h-auto"
                  >
                    <Badge variant={user.isActive ? "default" : "outline"}>
                      {user.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </Button>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditUser(user)}
                      title="Editar"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(user.id)}
                      title="Excluir"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          {editUser && (
            <UserForm
              user={editUser}
              onSuccess={() => {
                setEditUser(null)
                router.refresh()
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Excluir usuário"
        description="Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        loading={isPending}
        variant="destructive"
      />
    </>
  )
}
