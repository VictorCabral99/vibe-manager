import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { findAllEmployees } from "@/domains/pessoas/funcionarios/queries"
import { EmployeesTable } from "./employees-table"

export default async function FuncionariosPage() {
  const employees = await findAllEmployees()

  return (
    <div>
      <PageHeader
        title="Funcionários"
        description="Gerencie os funcionários da empresa"
        action={
          <Button asChild>
            <Link href="/pessoas/funcionarios/novo">Novo Funcionário</Link>
          </Button>
        }
      />
      <EmployeesTable employees={employees} />
    </div>
  )
}
