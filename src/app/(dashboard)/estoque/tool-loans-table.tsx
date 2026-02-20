"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/format"
import { returnToolAction } from "@/domains/estoque/actions"
import type { AllToolLoanItem } from "@/domains/estoque/queries"

interface ToolLoansTableProps {
  data: AllToolLoanItem[]
}

export function ToolLoansTable({ data }: ToolLoansTableProps) {
  const [returning, setReturning] = useState<string | null>(null)

  async function handleReturn(id: string) {
    setReturning(id)
    const result = await returnToolAction({ toolLoanId: id })
    if (result.success) {
      toast.success("Devolução registrada com sucesso")
    } else {
      toast.error(result.error ?? "Erro ao registrar devolução")
    }
    setReturning(null)
  }

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Nenhum empréstimo registrado.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Ferramenta</TableHead>
          <TableHead>Funcionário</TableHead>
          <TableHead className="text-right">Qtd</TableHead>
          <TableHead>Retirada</TableHead>
          <TableHead>Devolução</TableHead>
          <TableHead>Status</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((loan) => (
          <TableRow key={loan.id}>
            <TableCell className="font-medium">{loan.product.name}</TableCell>
            <TableCell>{loan.employee.user.name}</TableCell>
            <TableCell className="text-right">{Number(loan.quantity)}</TableCell>
            <TableCell>{formatDate(loan.loanedAt)}</TableCell>
            <TableCell>
              {loan.returnedAt ? formatDate(loan.returnedAt) : "—"}
            </TableCell>
            <TableCell>
              {loan.returnedAt ? (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Devolvido
                </Badge>
              ) : (
                <Badge variant="secondary">Em uso</Badge>
              )}
            </TableCell>
            <TableCell>
              {!loan.returnedAt && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={returning === loan.id}
                  onClick={() => handleReturn(loan.id)}
                >
                  {returning === loan.id ? "..." : "Devolver"}
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
