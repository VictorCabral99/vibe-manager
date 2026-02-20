import Link from "next/link"
import { QuoteStatus } from "@prisma/client"
import { Plus, FileWarning } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/shared/page-header"
import { findAllQuotes } from "@/domains/comercial/orcamentos/queries"
import { QuotesTable } from "./quotes-table"
import { OverdueReportButton } from "./overdue-report-button"

export default async function OrcamentosPage() {
  const [todos, pendentes, aprovados, pagos] = await Promise.all([
    findAllQuotes(),
    findAllQuotes({ status: QuoteStatus.PENDING }),
    findAllQuotes({ status: QuoteStatus.APPROVED }),
    findAllQuotes({ status: QuoteStatus.PAID }),
  ])

  return (
    <div>
      <PageHeader
        title="Orçamentos"
        description="Gerencie os orçamentos comerciais"
        action={
          <div className="flex gap-2">
            <OverdueReportButton />
            <Button asChild>
              <Link href="/comercial/orcamentos/novo">
                <Plus className="size-4 mr-2" />
                Novo Orçamento
              </Link>
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="todos">
        <TabsList className="mb-4">
          <TabsTrigger value="todos">
            Todos
            <span className="ml-1.5 text-xs rounded-full bg-muted px-1.5 py-0.5">
              {todos.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="pendentes">
            Pendentes
            <span className="ml-1.5 text-xs rounded-full bg-muted px-1.5 py-0.5">
              {pendentes.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="aprovados">
            Aprovados
            <span className="ml-1.5 text-xs rounded-full bg-muted px-1.5 py-0.5">
              {aprovados.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="pagos">
            Pagos
            <span className="ml-1.5 text-xs rounded-full bg-muted px-1.5 py-0.5">
              {pagos.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos">
          <QuotesTable quotes={todos} />
        </TabsContent>

        <TabsContent value="pendentes">
          <QuotesTable quotes={pendentes} />
        </TabsContent>

        <TabsContent value="aprovados">
          <QuotesTable quotes={aprovados} />
        </TabsContent>

        <TabsContent value="pagos">
          <QuotesTable quotes={pagos} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
