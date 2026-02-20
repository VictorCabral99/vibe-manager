import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { findProjectById, findActiveLaborProfessionals } from "@/domains/projetos/queries"
import { calculateProjectMargin } from "@/domains/projetos/calculations"
import { formatCurrency, formatDate, formatPercent } from "@/lib/format"
import { AddExpenseDialog } from "./add-expense-dialog"
import { AddLaborEntryDialog } from "./add-labor-entry-dialog"
import { CloseProjectButton } from "./close-project-button"
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

const expenseTypeLabels: Record<string, string> = {
  MATERIAL: "Material",
  LABOR: "Mão de Obra",
  OTHER: "Outros",
}

const statusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  CLOSED: "Encerrado",
  CANCELLED: "Cancelado",
}

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  CLOSED: "secondary",
  CANCELLED: "destructive",
}

const healthColors: Record<string, string> = {
  healthy: "bg-green-500",
  warning: "bg-yellow-500",
  danger: "bg-red-500",
}

const healthLabels: Record<string, string> = {
  healthy: "Saudável",
  warning: "Atenção",
  danger: "Crítico",
}

export default async function ProjetoDetailPage({ params }: PageProps) {
  const { id } = await params
  const [project, professionals] = await Promise.all([
    findProjectById(id),
    findActiveLaborProfessionals(),
  ])

  if (!project) notFound()

  const metrics = calculateProjectMargin({
    totalRevenue: Number(project.totalRevenue),
    targetMargin: Number(project.targetMargin),
    expenses: project.expenses.map((e) => ({ amount: Number(e.amount) })),
    laborEntries: project.laborEntries.map((l) => ({ total: Number(l.total) })),
  })

  const isActive = project.status === "ACTIVE"

  return (
    <div>
      <PageHeader
        title={project.name}
        description={`Cliente: ${project.client.name} • Iniciado em ${formatDate(project.startedAt)}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/projetos">
                <ArrowLeft className="size-4 mr-2" />
                Voltar
              </Link>
            </Button>
            {isActive && <CloseProjectButton projectId={project.id} />}
          </div>
        }
      />

      {/* Status badge */}
      <div className="flex items-center gap-2 mb-6">
        <Badge variant={statusVariants[project.status]}>{statusLabels[project.status]}</Badge>
        {project.closedAt && (
          <span className="text-sm text-muted-foreground">
            Encerrado em {formatDate(project.closedAt)}
          </span>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Total
            </CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Number(project.totalRevenue))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Despesas
            </CardTitle>
            <TrendingDown className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalExpenses)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Margem Estimada
            </CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.margin)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatPercent(metrics.marginPercent)} da receita
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Consumo / Saúde
            </CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(metrics.consumptionPercent)}</div>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{healthLabels[metrics.health]}</span>
                <span>Alvo: {formatPercent(Number(project.targetMargin))}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${healthColors[metrics.health]}`}
                  style={{
                    width: `${Math.min(metrics.consumptionPercent * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {project.notes && (
        <Card className="mb-6">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">{project.notes}</p>
          </CardContent>
        </Card>
      )}

      <Separator className="mb-6" />

      {/* Detail Tabs */}
      <Tabs defaultValue="expenses">
        <TabsList className="mb-4">
          <TabsTrigger value="expenses">
            Despesas ({project.expenses.length})
          </TabsTrigger>
          <TabsTrigger value="labor">
            Mão de Obra ({project.laborEntries.length})
          </TabsTrigger>
          <TabsTrigger value="purchases">
            Compras ({project.purchases.length})
          </TabsTrigger>
          <TabsTrigger value="stock">
            Estoque ({project.stockExits.length})
          </TabsTrigger>
        </TabsList>

        {/* Despesas */}
        <TabsContent value="expenses">
          <div className="flex justify-end mb-4">
            {isActive && <AddExpenseDialog projectId={project.id} />}
          </div>
          {project.expenses.length === 0 ? (
            <EmptyState
              title="Nenhuma despesa registrada"
              description="Registre a primeira despesa deste projeto."
            />
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Registrado por</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{formatDate(expense.date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {expenseTypeLabels[expense.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>{expense.registeredBy.name}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Number(expense.amount))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Mão de Obra */}
        <TabsContent value="labor">
          <div className="flex justify-end mb-4">
            {isActive && (
              <AddLaborEntryDialog
                projectId={project.id}
                professionals={professionals}
              />
            )}
          </div>
          {project.laborEntries.length === 0 ? (
            <EmptyState
              title="Nenhum lançamento de mão de obra"
              description="Registre a primeira diária deste projeto."
            />
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Profissional</TableHead>
                    <TableHead className="text-right">Diária</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.laborEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell className="font-medium">{entry.professional.name}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(entry.dailyRate))}
                      </TableCell>
                      <TableCell className="text-right">{Number(entry.quantity)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {entry.description ?? "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Number(entry.total))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Compras */}
        <TabsContent value="purchases">
          <div className="flex justify-end mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/compras/nova?projectId=${project.id}`}>Nova Compra</Link>
            </Button>
          </div>
          {project.purchases.length === 0 ? (
            <EmptyState
              title="Nenhuma compra vinculada"
              description="Vincule compras a este projeto ao criá-las."
            />
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Comprador</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead className="text-right">Itens</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell>{formatDate(purchase.date)}</TableCell>
                      <TableCell>{purchase.buyer.user.name}</TableCell>
                      <TableCell>{purchase.supplier ?? "—"}</TableCell>
                      <TableCell className="text-right">{purchase.items.length}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(Number(purchase.totalAmount))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Estoque */}
        <TabsContent value="stock">
          {project.stockExits.length === 0 ? (
            <EmptyState
              title="Nenhuma saída de estoque"
              description="Saídas de estoque vinculadas a este projeto aparecerão aqui."
            />
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead>Registrado por</TableHead>
                    <TableHead>Obs.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.stockExits.map((exit) => (
                    <TableRow key={exit.id}>
                      <TableCell>{formatDate(exit.createdAt)}</TableCell>
                      <TableCell className="font-medium">{exit.product.name}</TableCell>
                      <TableCell className="text-right">
                        {Number(exit.quantity)} {exit.product.unit}
                      </TableCell>
                      <TableCell>{exit.registeredBy.name}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {exit.notes ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
