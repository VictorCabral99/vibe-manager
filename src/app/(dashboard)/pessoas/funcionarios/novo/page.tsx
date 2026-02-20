import { PageHeader } from "@/components/shared/page-header"
import { findUsersWithoutEmployee } from "@/domains/pessoas/funcionarios/queries"
import { EmployeeForm } from "../employee-form"

export default async function NovoFuncionarioPage() {
  const availableUsers = await findUsersWithoutEmployee()

  return (
    <div className="max-w-lg">
      <PageHeader
        title="Novo Funcionário"
        description="Preencha os dados para cadastrar um novo funcionário"
      />
      <EmployeeForm availableUsers={availableUsers} />
    </div>
  )
}
