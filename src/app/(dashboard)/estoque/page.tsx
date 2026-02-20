import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import {
  findStockBalance,
  findStockEntries,
  findStockExits,
  findAllToolLoans,
} from "@/domains/estoque/queries"
import { formatDate } from "@/lib/format"
import { StockBalanceTable } from "./stock-balance-table"
import { ToolLoansTable } from "./tool-loans-table"

export const metadata = { title: "Estoque" }

const entryTypeLabels: Record<string, string> = {
  PURCHASE: "Compra",
  MANUAL: "Manual",
  RETURN: "Devolução",
}

const unitLabels: Record<string, string> = {
  UNIT: "un",
  KG: "kg",
  METER: "m",
  LITER: "L",
  BOX: "cx",
  PACKAGE: "pct",
}

export default async function EstoquePage() {
  const [balance, entries, exits, loans] = await Promise.all([
    findStockBalance(),
    findStockEntries(),
    findStockExits(),
    findAllToolLoans(),
  ])

  const lowStockCount = balance.filter((b) => b.isLow).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estoque"
        description="Controle de materiais, ferramentas e empréstimos"
      />

      {lowStockCount > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>{lowStockCount} produto{lowStockCount > 1 ? "s" : ""}</strong> com estoque abaixo
          do mínimo.
        </div>
      )}

      <Tabs defaultValue="balance">
        <TabsList>
          <TabsTrigger value="balance">
            Saldo Atual
            {lowStockCount > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                {lowStockCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="entries">Entradas ({entries.length})</TabsTrigger>
          <TabsTrigger value="exits">Saídas ({exits.length})</TabsTrigger>
          <TabsTrigger value="loans">Ferramentas ({loans.length})</TabsTrigger>
        </TabsList>

        {/* Saldo Atual */}
        <TabsContent value="balance" className="mt-4">
          <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando...</p>}>
            <StockBalanceTable data={balance} />
          </Suspense>
        </TabsContent>

        {/* Histórico de Entradas */}
        <TabsContent value="entries" className="mt-4">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma entrada registrada.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead>Registrado por</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => {
                  const unit = unitLabels[entry.product.unit] ?? entry.product.unit
                  const supplierName = entry.purchaseItem?.purchase?.supplier
                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {entryTypeLabels[entry.type] ?? entry.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {supplierName ?? entry.notes ?? "—"}
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-medium">
                        +{Number(entry.quantity)} {unit}
                      </TableCell>
                      <TableCell>{entry.registeredBy.name}</TableCell>
                      <TableCell>{formatDate(entry.createdAt)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        {/* Histórico de Saídas */}
        <TabsContent value="exits" className="mt-4">
          {exits.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhuma saída registrada.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead>Observação</TableHead>
                  <TableHead>Registrado por</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exits.map((exit) => {
                  const unit = unitLabels[exit.product.unit] ?? exit.product.unit
                  return (
                    <TableRow key={exit.id}>
                      <TableCell className="font-medium">{exit.product.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {exit.project?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-right text-red-500 font-medium">
                        -{Number(exit.quantity)} {unit}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {exit.notes ?? "—"}
                      </TableCell>
                      <TableCell>{exit.registeredBy.name}</TableCell>
                      <TableCell>{formatDate(exit.createdAt)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        {/* Ferramentas / Empréstimos */}
        <TabsContent value="loans" className="mt-4">
          <ToolLoansTable data={loans} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
