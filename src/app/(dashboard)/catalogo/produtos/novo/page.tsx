import { PageHeader } from "@/components/shared/page-header"
import { ProductForm } from "./product-form"

export default function NewProductPage() {
  return (
    <div>
      <PageHeader
        title="Novo Produto"
        description="Preencha os dados para cadastrar um novo produto no catálogo"
      />
      <ProductForm />
    </div>
  )
}
