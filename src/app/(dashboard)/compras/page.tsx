import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { findAllPurchases, findActiveBuyers } from "@/domains/compras/queries"
import { PurchasesTable } from "./purchases-table"
import { PurchaseFilters } from "./purchase-filters"
import { Plus } from "lucide-react"

interface PageProps {
  searchParams: Promise<{
    buyerId?: string
    fromDate?: string
    toDate?: string
  }>
}

export default async function ComprasPage({ searchParams }: PageProps) {
  const params = await searchParams
  const { buyerId, fromDate, toDate } = params

  const [purchases, buyers] = await Promise.all([
    findAllPurchases({
      buyerId: buyerId || undefined,
      fromDate: fromDate ? new Date(fromDate) : undefined,
      toDate: toDate ? new Date(toDate) : undefined,
    }),
    findActiveBuyers(),
  ])

  return (
    <div>
      <PageHeader
        title="Compras"
        description="Registre compras e acompanhe o consumo de materiais."
        action={
          <Button asChild>
            <Link href="/compras/nova">
              <Plus className="size-4 mr-2" />
              Nova Compra
            </Link>
          </Button>
        }
      />

      <PurchaseFilters buyers={buyers} />

      <PurchasesTable purchases={purchases} />
    </div>
  )
}
