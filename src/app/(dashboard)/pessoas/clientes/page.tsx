import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { findAllClients } from "@/domains/pessoas/clientes/queries"
import { ClientsTable } from "./clients-table"
import { Plus } from "lucide-react"

export default async function ClientsPage() {
  const clients = await findAllClients()

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Gerencie os clientes da empresa"
        action={
          <Button asChild>
            <Link href="/pessoas/clientes/novo">
              <Plus className="size-4 mr-2" />
              Novo Cliente
            </Link>
          </Button>
        }
      />
      <ClientsTable clients={clients} />
    </div>
  )
}
