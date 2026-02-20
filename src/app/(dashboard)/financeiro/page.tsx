import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { formatCurrency } from "@/lib/format"
import {
  findAllCashFlowEntries,
  findCashFlowSummary,
  findEntriesForPeriod,
} from "@/domains/financeiro/queries"
import { CashFlowTable } from "./cash-flow-table"
import { FinanceiroActionsBar } from "./financeiro-actions-bar"
import { PeriodSelector } from "./period-selector"
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3,
} from "lucide-react"
import { Suspense } from "react"

type Period = "day" | "week" | "month"

const PERIOD_DISPLAY: Record<Period, { label: string; sliceCount: number }> = {
  day: { label: "Últimos 30 dias", sliceCount: 30 },
  week: { label: "Últimas 12 semanas", sliceCount: 12 },
  month: { label: "Últimos 6 meses", sliceCount: 6 },
}

function formatPeriodKey(key: string, period: Period): string {
  if (period === "month") {
    const [year, month] = key.split("-")
    const date = new Date(Number(year), Number(month) - 1)
    return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })
  }
  if (period === "week") {
    return key // ex: 2024-W03
  }
  // day: YYYY-MM-DD → DD/MM
  const [, month, day] = key.split("-")
  return `${day}/${month}`
}

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const { period: rawPeriod } = await searchParams
  const period: Period =
    rawPeriod === "day" || rawPeriod === "week" ? rawPeriod : "month"

  const { sliceCount } = PERIOD_DISPLAY[period]

  const [summary, receivable, payable, periodData] = await Promise.all([
    findCashFlowSummary(),
    findAllCashFlowEntries({ direction: "IN" }),
    findAllCashFlowEntries({ direction: "OUT" }),
    findEntriesForPeriod(period),
  ])

  const periodEntries = Object.entries(periodData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-sliceCount)

  return (
    <div>
      <PageHeader
        title="Financeiro"
        description="Fluxo de caixa, contas a receber e a pagar"
        action={<FinanceiroActionsBar />}
      />

      {/* ─── Resumo ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* A Receber */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">A Receber</CardTitle>
            <ArrowDownCircle className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalReceivable)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Entradas pendentes
            </p>
          </CardContent>
        </Card>

        {/* A Pagar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">A Pagar</CardTitle>
            <ArrowUpCircle className="size-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalPayable)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Saídas pendentes
            </p>
          </CardContent>
        </Card>

        {/* Saldo Projetado */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Saldo Projetado
            </CardTitle>
            <Wallet className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                summary.projectedBalance >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {formatCurrency(summary.projectedBalance)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Recebíveis − Pagamentos
            </p>
          </CardContent>
        </Card>

        {/* Receita do Mês */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Resultado do Mês
            </CardTitle>
            {summary.netThisMonth >= 0 ? (
              <TrendingUp className="size-4 text-green-600" />
            ) : (
              <TrendingDown className="size-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                summary.netThisMonth >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(summary.netThisMonth)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Recebido − Pago no mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Tabs ─── */}
      <Tabs defaultValue="receivable">
        <TabsList className="mb-4">
          <TabsTrigger value="receivable">A Receber</TabsTrigger>
          <TabsTrigger value="payable">A Pagar</TabsTrigger>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        </TabsList>

        {/* A Receber */}
        <TabsContent value="receivable">
          <Card>
            <CardHeader>
              <CardTitle>Contas a Receber</CardTitle>
              <CardDescription>
                Orçamentos aprovados e outros recebíveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CashFlowTable entries={receivable} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* A Pagar */}
        <TabsContent value="payable">
          <Card>
            <CardHeader>
              <CardTitle>Contas a Pagar</CardTitle>
              <CardDescription>
                Compras, mão de obra e contas externas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CashFlowTable entries={payable} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visão Geral */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Receita e despesa mensal */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="size-4 text-muted-foreground" />
                    <CardTitle className="text-base">
                      Fluxo de Caixa — {PERIOD_DISPLAY[period].label}
                    </CardTitle>
                  </div>
                  <Suspense>
                    <PeriodSelector current={period} />
                  </Suspense>
                </div>
              </CardHeader>
              <CardContent>
                {periodEntries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Sem dados para exibir.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {periodEntries.map(([key, data]) => (
                      <div key={key} className="flex items-center gap-4">
                        <span className="w-20 text-sm text-muted-foreground shrink-0">
                          {formatPeriodKey(key, period)}
                        </span>
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <ArrowDownCircle className="size-3 text-green-600 shrink-0" />
                            <span className="text-sm font-medium text-green-600">
                              {formatCurrency(data.in)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ArrowUpCircle className="size-3 text-red-600 shrink-0" />
                            <span className="text-sm font-medium text-red-600">
                              {formatCurrency(data.out)}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-sm font-semibold w-28 text-right shrink-0 ${
                            data.in - data.out >= 0
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {formatCurrency(data.in - data.out)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sub-resumo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recebido este mês</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(summary.receivedThisMonth)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total de entradas pagas no mês atual
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pago este mês</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">
                  {formatCurrency(summary.paidThisMonth)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total de saídas pagas no mês atual
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
