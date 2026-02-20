import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { findAllClients } from "@/domains/pessoas/clientes/queries"
import { ProjectForm } from "./project-form"
import { ArrowLeft } from "lucide-react"

export default async function NovoProjetoPage() {
  const clients = await findAllClients()
  const activeClients = clients.filter((c) => c.isActive)

  return (
    <div>
      <PageHeader
        title="Novo Projeto"
        description="Crie um projeto manualmente a partir de um cliente."
        action={
          <Button variant="outline" asChild>
            <Link href="/projetos">
              <ArrowLeft className="size-4 mr-2" />
              Voltar
            </Link>
          </Button>
        }
      />

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Dados do Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectForm clients={activeClients} />
        </CardContent>
      </Card>
    </div>
  )
}
