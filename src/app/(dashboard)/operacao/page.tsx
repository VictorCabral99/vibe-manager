import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/shared/page-header"
import { findAllAlerts } from "@/domains/operacao/queries"
import { AlertsTable } from "./alerts-table"
import { Plus, ShieldAlert, AlertTriangle, Info, Activity, Monitor } from "lucide-react"

export default async function OperacaoPage() {
  const [activeAlerts, resolvedAlerts] = await Promise.all([
    findAllAlerts("ACTIVE"),
    findAllAlerts("RESOLVED"),
  ])

  const criticalCount = activeAlerts.filter(
    (a) => a.priority === "CRITICAL"
  ).length
  const highCount = activeAlerts.filter((a) => a.priority === "HIGH").length
  const mediumCount = activeAlerts.filter((a) => a.priority === "MEDIUM").length
  const lowCount = activeAlerts.filter((a) => a.priority === "LOW").length

  return (
    <div>
      <PageHeader
        title="Operacao"
        description="Monitore e gerencie alertas operacionais"
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/operacao/display">
                <Monitor className="size-4 mr-2" />
                Tela de Operação
              </Link>
            </Button>
            <Button asChild>
              <Link href="/operacao/novo">
                <Plus className="size-4 mr-2" />
                Novo Alerta
              </Link>
            </Button>
          </div>
        }
      />

      {/* ─── Contadores por prioridade ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Crítico */}
        <Card
          className={`border-2 ${
            criticalCount > 0
              ? "border-red-500 bg-red-50 dark:bg-red-950/30"
              : "border-transparent"
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">
              Crítico
            </CardTitle>
            <div className="relative">
              <ShieldAlert className="size-5 text-red-600" />
              {criticalCount > 0 && (
                <span className="absolute -top-1 -right-1 flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-2 bg-red-600" />
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-red-600">{criticalCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {criticalCount === 1 ? "alerta" : "alertas"} críticos
            </p>
          </CardContent>
        </Card>

        {/* Alto */}
        <Card
          className={`border-2 ${
            highCount > 0
              ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
              : "border-transparent"
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
              Alto
            </CardTitle>
            <AlertTriangle className="size-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-orange-500">{highCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {highCount === 1 ? "alerta" : "alertas"} de prioridade alta
            </p>
          </CardContent>
        </Card>

        {/* Médio */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
              Médio
            </CardTitle>
            <Activity className="size-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-yellow-600">{mediumCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {mediumCount === 1 ? "alerta" : "alertas"} de prioridade média
            </p>
          </CardContent>
        </Card>

        {/* Baixo */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Baixo</CardTitle>
            <Info className="size-5 text-slate-400" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-slate-500">{lowCount}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {lowCount === 1 ? "alerta" : "alertas"} de baixa prioridade
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ─── Tabs ─── */}
      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active" className="gap-2">
            Ativos
            {activeAlerts.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {activeAlerts.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolvidos
            {resolvedAlerts.length > 0 && (
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {resolvedAlerts.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Alertas Ativos</CardTitle>
              <CardDescription>
                Alertas que requerem atenção ou ação imediata
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertsTable alerts={activeAlerts} showResolveAction />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolved">
          <Card>
            <CardHeader>
              <CardTitle>Alertas Resolvidos</CardTitle>
              <CardDescription>
                Histórico de alertas que foram solucionados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertsTable alerts={resolvedAlerts} showResolveAction={false} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
