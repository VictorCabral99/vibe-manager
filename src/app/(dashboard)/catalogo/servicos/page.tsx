import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { findAllServices } from "@/domains/catalogo/servicos/queries"
import { ServicesTable } from "./services-table"
import { Plus } from "lucide-react"

export default async function ServicesPage() {
  const services = await findAllServices()

  return (
    <div>
      <PageHeader
        title="Serviços"
        description="Gerencie os serviços oferecidos pela empresa"
        action={
          <Button asChild>
            <Link href="/catalogo/servicos/novo">
              <Plus className="size-4 mr-2" />
              Novo Serviço
            </Link>
          </Button>
        }
      />
      <ServicesTable services={services} />
    </div>
  )
}
