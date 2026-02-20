"use client"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { StockBalanceItem } from "@/domains/estoque/queries"

const unitLabels: Record<string, string> = {
  UNIT: "un",
  KG: "kg",
  METER: "m",
  LITER: "L",
  BOX: "cx",
  PACKAGE: "pct",
}

interface StockBalanceTableProps {
  data: StockBalanceItem[]
}

export function StockBalanceTable({ data }: StockBalanceTableProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Nenhum produto cadastrado.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Produto</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead className="text-right">Entradas</TableHead>
          <TableHead className="text-right">Saídas</TableHead>
          <TableHead className="text-right">Emprestado</TableHead>
          <TableHead className="text-right">Saldo</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => {
          const unit = unitLabels[item.product.unit] ?? item.product.unit
          return (
            <TableRow key={item.product.id}>
              <TableCell className="font-medium">{item.product.name}</TableCell>
              <TableCell className="text-muted-foreground">{item.product.category}</TableCell>
              <TableCell className="text-right text-green-600">
                +{item.totalIn} {unit}
              </TableCell>
              <TableCell className="text-right text-red-500">
                -{item.totalOut} {unit}
              </TableCell>
              <TableCell className="text-right text-amber-600">
                {item.loanedOut} {unit}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {item.balance} {unit}
              </TableCell>
              <TableCell>
                {item.isLow ? (
                  <Badge variant="destructive">Estoque Baixo</Badge>
                ) : (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    OK
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
