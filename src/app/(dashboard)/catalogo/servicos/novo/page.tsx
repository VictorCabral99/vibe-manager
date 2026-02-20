import { PageHeader } from "@/components/shared/page-header"
import { ServiceForm } from "./service-form"

export default function NewServicePage() {
  return (
    <div>
      <PageHeader
        title="Novo Serviço"
        description="Preencha os dados para cadastrar um novo serviço no catálogo"
      />
      <ServiceForm />
    </div>
  )
}
