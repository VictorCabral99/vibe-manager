import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/shared/page-header"
import { findClientById } from "@/domains/pessoas/clientes/queries"
import { formatDocument, formatDate } from "@/lib/format"
import { Pencil, Phone, Mail, MapPin, FileText, Receipt, FolderOpen } from "lucide-react"
import type { QuoteStatus, ProjectStatus } from "@prisma/client"

interface ClientPageProps {
  params: Promise<{ id: string }>
}

const quoteStatusLabel: Record<QuoteStatus, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  PAID: "Pago",
  CANCELLED: "Cancelado",
}

const quoteStatusVariant: Record<
  QuoteStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  PENDING: "secondary",
  APPROVED: "default",
  PAID: "default",
  CANCELLED: "destructive",
}

const projectStatusLabel: Record<ProjectStatus, string> = {
  ACTIVE: "Ativo",
  CLOSED: "Encerrado",
  CANCELLED: "Cancelado",
}

const projectStatusVariant: Record<
  ProjectStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  ACTIVE: "default",
  CLOSED: "secondary",
  CANCELLED: "destructive",
}

export default async function ClientPage({ params }: ClientPageProps) {
  const { id } = await params
  const client = await findClientById(id)

  if (!client) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={client.name}
        description={client.isActive ? "Cliente ativo" : "Cliente inativo"}
        action={
          <Button asChild variant="outline">
            <Link href={`/pessoas/clientes/${id}/editar`}>
              <Pencil className="size-4 mr-2" />
              Editar
            </Link>
          </Button>
        }
      />

      {/* Dados do cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {client.document && (
              <div className="flex items-start gap-2">
                <FileText className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Documento</p>
                  <p className="text-sm font-medium">{formatDocument(client.document)}</p>
                </div>
              </div>
            )}

            {client.phone && (
              <div className="flex items-start gap-2">
                <Phone className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <p className="text-sm font-medium">{client.phone}</p>
                </div>
              </div>
            )}

            {client.email && (
              <div className="flex items-start gap-2">
                <Mail className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">E-mail</p>
                  <p className="text-sm font-medium">{client.email}</p>
                </div>
              </div>
            )}

            {client.address && (
              <div className="flex items-start gap-2">
                <MapPin className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Endereço</p>
                  <p className="text-sm font-medium">{client.address}</p>
                </div>
              </div>
            )}
          </div>

          {client.notes && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Observações</p>
                <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
              </div>
            </>
          )}

          {!client.document && !client.phone && !client.email && !client.address && !client.notes && (
            <p className="text-sm text-muted-foreground">Nenhuma informação adicional cadastrada.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Orçamentos recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="size-4" />
              Orçamentos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {client.quotes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum orçamento encontrado.</p>
            ) : (
              <div className="space-y-2">
                {client.quotes.map((quote) => (
                  <div
                    key={quote.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium font-mono text-muted-foreground">
                        #{quote.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(quote.createdAt)}
                      </p>
                    </div>
                    <Badge variant={quoteStatusVariant[quote.status]}>
                      {quoteStatusLabel[quote.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projetos recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FolderOpen className="size-4" />
              Projetos Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {client.projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum projeto encontrado.</p>
            ) : (
              <div className="space-y-2">
                {client.projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <p className="text-sm font-medium">{project.name}</p>
                    <Badge variant={projectStatusVariant[project.status]}>
                      {projectStatusLabel[project.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
