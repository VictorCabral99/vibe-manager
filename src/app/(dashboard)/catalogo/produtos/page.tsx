import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/shared/page-header"
import { findAllProducts } from "@/domains/catalogo/produtos/queries"
import { ProductsTable } from "./products-table"
import { Plus } from "lucide-react"

export default async function ProductsPage() {
  const [all, materials, tools] = await Promise.all([
    findAllProducts(),
    findAllProducts({ type: "MATERIAL" }),
    findAllProducts({ type: "TOOL" }),
  ])

  return (
    <div>
      <PageHeader
        title="Produtos"
        description="Gerencie materiais e ferramentas do catálogo"
        action={
          <Button asChild>
            <Link href="/catalogo/produtos/novo">
              <Plus className="size-4 mr-2" />
              Novo Produto
            </Link>
          </Button>
        }
      />

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">
            Todos ({all.length})
          </TabsTrigger>
          <TabsTrigger value="materials">
            Materiais ({materials.length})
          </TabsTrigger>
          <TabsTrigger value="tools">
            Ferramentas ({tools.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ProductsTable products={all} />
        </TabsContent>

        <TabsContent value="materials">
          <ProductsTable products={materials} />
        </TabsContent>

        <TabsContent value="tools">
          <ProductsTable products={tools} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
