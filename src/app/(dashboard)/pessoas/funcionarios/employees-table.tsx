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
import { formatDocument } from "@/lib/format"
import {
  toggleEmployeeActiveAction,
  deleteEmployeeAction,
} from "@/domains/pessoas/funcionarios/actions"
import type { EmployeeListItem } from "@/domains/pessoas/funcionarios/queries"
import { Pencil, Trash2, Users } from "lucide-react"
import { EmployeeForm } from "./employee-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface EmployeesTableProps {
  employees: EmployeeListItem[]
}

export function EmployeesTable({ employees }: EmployeesTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editEmployee, setEditEmployee] = useState<EmployeeListItem | null>(null)
  const [loadingToggleId, setLoadingToggleId] = useState<string | null>(null)

  function handleToggleActive(id: string) {
    setLoadingToggleId(id)
    startTransition(async () => {
      const result = await toggleEmployeeActiveAction(id)
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
      const result = await deleteEmployeeAction(deleteId)
      if (result.success) {
        toast.success("Funcionário excluído com sucesso")
        setDeleteId(null)
        router.refresh()
      } else {
        toast.error(result.error ?? "Erro ao excluir funcionário")
      }
    })
  }

  if (employees.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="Nenhum funcionário encontrado"
        description="Crie o primeiro funcionário para começar."
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
              <TableHead>CPF</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Pode Comprar</TableHead>
              <TableHead>Pode Retirar Estoque</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">
                  <div>
                    <span>{employee.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {employee.user.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {employee.cpf ? formatDocument(employee.cpf) : "—"}
                </TableCell>
                <TableCell>{employee.jobTitle}</TableCell>
                <TableCell>
                  <Badge variant={employee.canPurchase ? "default" : "outline"}>
                    {employee.canPurchase ? "Sim" : "Não"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={employee.canWithdrawStock ? "default" : "outline"}>
                    {employee.canWithdrawStock ? "Sim" : "Não"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(employee.id)}
                    disabled={loadingToggleId === employee.id || isPending}
                    className="p-0 h-auto"
                  >
                    <Badge variant={employee.isActive ? "default" : "outline"}>
                      {employee.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditEmployee(employee)}
                      title="Editar"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(employee.id)}
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

      <Dialog open={!!editEmployee} onOpenChange={(open) => !open && setEditEmployee(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Funcionário</DialogTitle>
          </DialogHeader>
          {editEmployee && (
            <EmployeeForm
              employee={editEmployee}
              onSuccess={() => {
                setEditEmployee(null)
                router.refresh()
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Excluir funcionário"
        description="Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        loading={isPending}
        variant="destructive"
      />
    </>
  )
}
