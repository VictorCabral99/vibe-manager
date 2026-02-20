import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { QuoteStatus } from "@prisma/client"
import {
  ArrowLeft,
  Pencil,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  FolderOpen,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader } from "@/components/shared/page-header"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/format"
import { calculateQuoteTotals } from "@/domains/comercial/orcamentos/calculations"
import { findQuoteById } from "@/domains/comercial/orcamentos/queries"
import { QuoteDetailActions } from "./quote-detail-actions"

// ─────────────────────────────────────────────
// Helpers de exibição
// ─────────────────────────────────────────────

const STATUS_LABELS: Record<QuoteStatus, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  PAID: "Pago",
  CANCELLED: "Cancelado",
}

const STATUS_COLORS: Record<QuoteStatus, string> = {
  PENDING:
    "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400",
  APPROVED:
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
  PAID: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED:
    "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400",
}

const STATUS_ICONS: Record<QuoteStatus, React.ComponentType<{ className?: string }>> = {
  PENDING: Clock,
  APPROVED: CheckCircle2,
  PAID: DollarSign,
  CANCELLED: XCircle,
}

// ─────────────────────────────────────────────
// Página de detalhes
// ─────────────────────────────────────────────

interface OrcamentoPageProps {
  params: Promise<{ id: string }>
}

export default async function OrcamentoDetailPage({ params }: OrcamentoPageProps) {
  const { id } = await params
  const quote = await findQuoteById(id)

  if (!quote) notFound()

  // Monta inputs para calculateQuoteTotals
  const itemInputs = quote.items.map((item) => ({
    productId: item.productId,
    productName: item.product.name,
    quantity: item.quantity.toNumber(),
    unitPrice: item.unitPrice.toNumber(),
  }))

  const serviceInputs = quote.services.map((svc) => ({
    serviceId: svc.serviceId,
    serviceName: svc.service.name,
    quantity: svc.quantity.toNumber(),
    unitPrice: svc.unitPrice.toNumber(),
    description: svc.description ?? undefined,
  }))

  const totals = calculateQuoteTotals(itemInputs, serviceInputs, quote.applyFee)

  const StatusIcon = STATUS_ICONS[quote.status]

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Orçamento #${quote.id.slice(-8).toUpperCase()}`}
        description={`Cliente: ${quote.client.name}`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/comercial/orcamentos">
                <ArrowLeft className="size-4 mr-2" />
                Voltar
              </Link>
            </Button>
            {quote.status === QuoteStatus.PENDING && (
              <Button variant="outline" asChild>
                <Link href={`/comercial/orcamentos/${quote.id}/editar`}>
                  <Pencil className="size-4 mr-2" />
                  Editar
                </Link>
              </Button>
            )}
          </div>
        }
      />

      {/* Status e informações gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-muted">
                <StatusIcon className="size-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium mt-0.5 ${STATUS_COLORS[quote.status]}`}
                >
                  {STATUS_LABELS[quote.status]}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Criado em</p>
            <p className="font-medium mt-0.5">{formatDateTime(quote.createdAt)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">por {quote.createdBy.name}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total do Orçamento</p>
            <p className="text-2xl font-bold text-green-600 mt-0.5">
              {formatCurrency(totals.total)}
            </p>
            {quote.applyFee && (
              <p className="text-xs text-muted-foreground mt-0.5">Inclui taxa de 15%</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Projeto vinculado */}
      {quote.project && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="size-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                Convertido em Projeto:{" "}
                <Link
                  href={`/projetos/${quote.project.id}`}
                  className="underline hover:no-underline"
                >
                  {quote.project.name}
                </Link>
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de itens */}
      {quote.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Itens (Produtos)</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead className="text-right">Preço Unit.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quote.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {item.product.category}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.quantity.toNumber()} {item.product.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unitPrice.toNumber())}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.total.toNumber())}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2">
                  <TableCell colSpan={4} className="text-right font-semibold">
                    Subtotal Produtos
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(totals.subtotalItems)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tabela de serviços */}
      {quote.services.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead className="text-right">Preço Unit.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quote.services.map((svc) => (
                  <TableRow key={svc.id}>
                    <TableCell className="font-medium">{svc.service.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {svc.description ?? svc.service.description ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">{svc.quantity.toNumber()}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(svc.unitPrice.toNumber())}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(svc.total.toNumber())}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2">
                  <TableCell colSpan={4} className="text-right font-semibold">
                    Subtotal Serviços
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(totals.subtotalServices)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Resumo financeiro */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-w-sm ml-auto">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal Produtos</span>
              <span>{formatCurrency(totals.subtotalItems)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal Serviços</span>
              <span>{formatCurrency(totals.subtotalServices)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            {quote.applyFee && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxa de Serviço (15%)</span>
                <span className="text-orange-600">{formatCurrency(totals.fee)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-green-600">{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      {quote.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{quote.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Log de status */}
      {quote.statusLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {quote.statusLogs.map((log) => (
                  <div key={log.id} className="flex gap-3 text-sm">
                    <div className="pt-0.5">
                      <div className="size-2 rounded-full bg-primary mt-1.5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {log.fromStatus && (
                          <>
                            <span className="text-muted-foreground">
                              {STATUS_LABELS[log.fromStatus]}
                            </span>
                            <span className="text-muted-foreground">→</span>
                          </>
                        )}
                        <span className="font-medium">{STATUS_LABELS[log.toStatus]}</span>
                        <span className="text-muted-foreground text-xs ml-auto">
                          {formatDateTime(log.createdAt)}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        por {log.changedBy.name}
                        {log.notes ? ` — ${log.notes}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Ações */}
      <QuoteDetailActions
        quote={{
          id: quote.id,
          status: quote.status,
          hasProject: !!quote.project,
        }}
        total={totals.total}
      />
    </div>
  )
}
