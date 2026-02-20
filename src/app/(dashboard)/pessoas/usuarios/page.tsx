import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { findAllUsers } from "@/domains/pessoas/usuarios/queries"
import { UsersTable } from "./users-table"

export default async function UsuariosPage() {
  const users = await findAllUsers()

  return (
    <div>
      <PageHeader
        title="Usuários"
        description="Gerencie os usuários com acesso ao sistema"
        action={
          <Button asChild>
            <Link href="/pessoas/usuarios/novo">Novo Usuário</Link>
          </Button>
        }
      />
      <UsersTable users={users} />
    </div>
  )
}
