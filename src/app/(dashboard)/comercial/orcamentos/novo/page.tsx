import { PageHeader } from "@/components/shared/page-header"
import {
  findActiveClients,
  findActiveProducts,
  findActiveServices,
} from "@/domains/comercial/orcamentos/queries"
import { QuoteForm } from "../quote-form"

export default async function NovoOrcamentoPage() {
  const [clients, products, services] = await Promise.all([
    findActiveClients(),
    findActiveProducts(),
    findActiveServices(),
  ])

  return (
    <div>
      <PageHeader
        title="Novo Orçamento"
        description="Preencha os dados para criar um novo orçamento"
      />
      <QuoteForm clients={clients} products={products} services={services} />
    </div>
  )
}
