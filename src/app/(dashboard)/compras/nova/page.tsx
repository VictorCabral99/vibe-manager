import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { findActiveBuyers } from "@/domains/compras/queries"
import { findActiveProjects } from "@/domains/projetos/queries"
import { prisma } from "@/lib/prisma"
import { PurchaseForm } from "./purchase-form"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  searchParams: Promise<{ projectId?: string }>
}

export default async function NovaCompraPage({ searchParams }: PageProps) {
  const { projectId } = await searchParams

  const [buyers, projects, products] = await Promise.all([
    findActiveBuyers(),
    findActiveProjects(),
    prisma.product.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true, name: true, unit: true, category: true },
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <div>
      <PageHeader
        title="Nova Compra"
        description="Registre uma compra e atualize o estoque automaticamente."
        action={
          <Button variant="outline" asChild>
            <Link href="/compras">
              <ArrowLeft className="size-4 mr-2" />
              Voltar
            </Link>
          </Button>
        }
      />

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Dados da Compra</CardTitle>
        </CardHeader>
        <CardContent>
          <PurchaseForm
            buyers={buyers}
            products={products}
            projects={projects}
            defaultProjectId={projectId}
          />
        </CardContent>
      </Card>
    </div>
  )
}
