import { PageHeader } from "@/components/shared/page-header"
import { UserForm } from "../user-form"

export default function NovoUsuarioPage() {
  return (
    <div className="max-w-lg">
      <PageHeader
        title="Novo Usuário"
        description="Preencha os dados para criar um novo usuário no sistema"
      />
      <UserForm />
    </div>
  )
}
