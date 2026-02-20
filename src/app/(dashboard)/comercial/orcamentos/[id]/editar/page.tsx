import { notFound } from "next/navigation"
import { QuoteStatus } from "@prisma/client"
import { PageHeader } from "@/components/shared/page-header"
import {
  findQuoteById,
  findActiveClients,
  findActiveProducts,
  findActiveServices,
} from "@/domains/comercial/orcamentos/queries"
import { QuoteForm } from "../../quote-form"

interface EditarOrcamentoPageProps {
  params: Promise<{ id: string }>
}

export default async function EditarOrcamentoPage({ params }: EditarOrcamentoPageProps) {
  const { id } = await params
  const [quote, clients, products, services] = await Promise.all([
    findQuoteById(id),
    findActiveClients(),
    findActiveProducts(),
    findActiveServices(),
  ])

  if (!quote) notFound()

  // Apenas orçamentos PENDING podem ser editados
  if (quote.status !== QuoteStatus.PENDING) {
    notFound()
  }

  return (
    <div>
      <PageHeader
        title="Editar Orçamento"
        description={`Orçamento #${id.slice(-8).toUpperCase()} — ${quote.client.name}`}
      />
      <QuoteForm
        clients={clients}
        products={products}
        services={services}
        defaultValues={{
          id: quote.id,
          clientId: quote.clientId,
          applyFee: quote.applyFee,
          notes: quote.notes,
          items: quote.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity.toNumber(),
            unitPrice: item.unitPrice.toNumber(),
          })),
          services: quote.services.map((svc) => ({
            serviceId: svc.serviceId,
            quantity: svc.quantity.toNumber(),
            unitPrice: svc.unitPrice.toNumber(),
            description: svc.description,
          })),
        }}
      />
    </div>
  )
}
