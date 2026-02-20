import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageHeader } from "@/components/shared/page-header"
import { findAllProjects } from "@/domains/projetos/queries"
import { ProjectsTable } from "./projects-table"
import { Plus } from "lucide-react"

export default async function ProjetosPage() {
  const [activeProjects, closedProjects, allProjects] = await Promise.all([
    findAllProjects("ACTIVE"),
    findAllProjects("CLOSED"),
    findAllProjects(),
  ])

  return (
    <div>
      <PageHeader
        title="Projetos"
        description="Gerencie os projetos e acompanhe margens e despesas."
        action={
          <Button asChild>
            <Link href="/projetos/novo">
              <Plus className="size-4 mr-2" />
              Novo Projeto
            </Link>
          </Button>
        }
      />

      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active">
            Ativos
            <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
              {activeProjects.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="closed">
            Encerrados
            <span className="ml-2 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
              {closedProjects.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="all">
            Todos
            <span className="ml-2 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
              {allProjects.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <ProjectsTable projects={activeProjects} />
        </TabsContent>

        <TabsContent value="closed">
          <ProjectsTable projects={closedProjects} />
        </TabsContent>

        <TabsContent value="all">
          <ProjectsTable projects={allProjects} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
