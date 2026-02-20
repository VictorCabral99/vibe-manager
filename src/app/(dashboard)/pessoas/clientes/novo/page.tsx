import { PageHeader } from "@/components/shared/page-header"
import { ClientForm } from "./client-form"

export default function NewClientPage() {
  return (
    <div>
      <PageHeader
        title="Novo Cliente"
        description="Preencha os dados para cadastrar um novo cliente"
      />
      <ClientForm />
    </div>
  )
}
