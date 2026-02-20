import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { findAllProjects } from "@/domains/projetos/queries"
import { findAllProducts } from "@/domains/catalogo/produtos/queries"
import { prisma } from "@/lib/prisma"
import { AlertForm } from "./alert-form"

export default async function NewAlertPage() {
  const [projectsRaw, productsRaw, employeesRaw] = await Promise.all([
    findAllProjects("ACTIVE"),
    findAllProducts({ isActive: true }),
    prisma.employee.findMany({
      where: { isActive: true, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ])

  const projects = projectsRaw.map((p) => ({ id: p.id, name: p.name }))
  const products = productsRaw.map((p) => ({ id: p.id, name: p.name }))
  const employees = employeesRaw.map((e) => ({ id: e.id, name: e.name }))

  return (
    <div>
      <PageHeader
        title="Novo Alerta"
        description="Registre um alerta operacional para acompanhamento"
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Dados do Alerta</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertForm
            projects={projects}
            products={products}
            employees={employees}
          />
        </CardContent>
      </Card>
    </div>
  )
}
