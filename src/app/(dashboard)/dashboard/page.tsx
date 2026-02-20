import Link from "next/link"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ClipboardList,
  FolderKanban,
  Package,
  AlertTriangle,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/format"
import { getDashboardData } from "@/domains/dashboard/queries"
import { QuoteStatus, ProjectStatus } from "@prisma/client"

// QuoteStatus: PENDING | APPROVED | PAID | CANCELLED
const quoteStatusLabels: Record<QuoteStatus, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  PAID: "Pago",
  CANCELLED: "Cancelado",
}

const quoteStatusVariant: Record<QuoteStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary",
  APPROVED: "default",
  PAID: "outline",
  CANCELLED: "destructive",
}

// ProjectStatus: ACTIVE | CLOSED | CANCELLED
const projectStatusLabels: Record<ProjectStatus, string> = {
  ACTIVE: "Ativo",
  CLOSED: "Encerrado",
  CANCELLED: "Cancelado",
}

const alertPriorityVariant = {
  LOW: "secondary",
  MEDIUM: "default",
  HIGH: "outline",
  CRITICAL: "destructive",
} as const

const unitLabels: Record<string, string> = {
  UNIT: "un",
  KG: "kg",
  METER: "m",
  LITER: "L",
  BOX: "cx",
  PACKAGE: "pct",
}

export const metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  const data = await getDashboardData()
  const { financial, quotes, projects, stock, alerts } = data

  const approvedCount = quotes.stats[QuoteStatus.APPROVED] ?? 0
  const pendingCount = quotes.stats[QuoteStatus.PENDING] ?? 0
  const paidCount = quotes.stats[QuoteStatus.PAID] ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do negócio</p>
      </div>

      {/* ── Cards financeiros ──────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Entradas (mês)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(financial.monthlyIn)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saídas (mês)
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">
              {formatCurrency(financial.monthlyOut)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo do Mês
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                financial.monthlyBalance >= 0 ? "text-green-600" : "text-red-500"
              }`}
            >
              {formatCurrency(financial.monthlyBalance)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              A Receber
            </CardTitle>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">
              {formatCurrency(financial.pendingReceivable)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              A pagar: {formatCurrency(financial.pendingPayable)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Linha de indicadores ───────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Orçamentos
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{approvedCount + pendingCount + paidCount}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {approvedCount > 0 && (
                <Badge variant="default" className="text-xs">
                  {approvedCount} aprovado{approvedCount !== 1 ? "s" : ""}
                </Badge>
              )}
              {pendingCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {pendingCount} pendente{pendingCount !== 1 ? "s" : ""}
                </Badge>
              )}
              {paidCount > 0 && (
                <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                  {paidCount} pago{paidCount !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Projetos Ativos
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{projects.activeCount}</p>
            <p className="text-xs text-muted-foreground mt-1">em execução</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alertas de Estoque
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                stock.lowStockAlerts.length > 0 ? "text-amber-600" : ""
              }`}
            >
              {stock.lowStockAlerts.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              produto{stock.lowStockAlerts.length !== 1 ? "s" : ""} abaixo do mínimo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Orçamentos recentes + Projetos recentes ────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Orçamentos Recentes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/comercial/orcamentos">
                Ver todos <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {quotes.recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum orçamento ainda.</p>
            ) : (
              <ul className="space-y-3">
                {quotes.recent.map((q) => (
                  <li key={q.id} className="flex items-center justify-between">
                    <div>
                      <Link
                        href={`/comercial/orcamentos/${q.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        #{q.id.slice(-8)} — {q.client.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{formatDate(q.createdAt)}</p>
                    </div>
                    <Badge variant={quoteStatusVariant[q.status]} className="text-xs">
                      {quoteStatusLabels[q.status]}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Projetos Recentes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/projetos">
                Ver todos <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {projects.recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum projeto ainda.</p>
            ) : (
              <ul className="space-y-3">
                {projects.recent.map((p) => (
                  <li key={p.id} className="flex items-center justify-between">
                    <div>
                      <Link
                        href={`/projetos/${p.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {p.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {p.client.name} · início {formatDate(p.startedAt)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {projectStatusLabels[p.status]}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Estoque baixo + Alertas ────────────────────── */}
      {(stock.lowStockAlerts.length > 0 || alerts.length > 0) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {stock.lowStockAlerts.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-amber-500" />
                  Estoque Baixo
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/estoque">
                    Ver estoque <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {stock.lowStockAlerts.map((p) => {
                    const unit = unitLabels[p.unit] ?? p.unit
                    return (
                      <li key={p.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-amber-600 font-semibold">
                          {p.balance} {unit}
                          <span className="text-muted-foreground font-normal">
                            {" "}(mín: {p.minimumStock} {unit})
                          </span>
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>
          )}

          {alerts.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Alertas do Sistema
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/operacao">
                    Ver todos <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {alerts.map((alert) => (
                    <li key={alert.id} className="flex items-center justify-between text-sm">
                      <span>{alert.title}</span>
                      <Badge
                        variant={alertPriorityVariant[alert.priority] ?? "secondary"}
                        className="text-xs"
                      >
                        {alert.priority}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
