"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { EmptyState } from "@/components/shared/empty-state"
import { toggleProductActiveAction, deleteProductAction } from "@/domains/catalogo/produtos/actions"
import type { ProductListItem } from "@/domains/catalogo/produtos/queries"
import { MoreHorizontal, Pencil, Trash2, ToggleLeft, Package } from "lucide-react"
import Link from "next/link"
import type { MeasurementUnit, ProductType } from "@prisma/client"

interface ProductsTableProps {
  products: ProductListItem[]
}

const unitLabel: Record<MeasurementUnit, string> = {
  UNIT: "Unidade",
  KG: "Kg",
  METER: "Metro",
  LITER: "Litro",
  BOX: "Caixa",
  PACKAGE: "Pacote",
}

const typeLabel: Record<ProductType, string> = {
  MATERIAL: "Material",
  TOOL: "Ferramenta",
}

export function ProductsTable({ products }: ProductsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleToggleActive(id: string) {
    setLoadingId(id)
    const result = await toggleProductActiveAction(id)
    setLoadingId(null)
    if (result.success) {
      toast.success("Status atualizado com sucesso")
    } else {
      toast.error(result.error ?? "Erro ao alterar status")
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setLoadingId(deleteId)
    const result = await deleteProductAction(deleteId)
    setLoadingId(null)
    setDeleteId(null)
    if (result.success) {
      toast.success("Produto excluído com sucesso")
    } else {
      toast.error(result.error ?? "Erro ao excluir produto")
    }
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="Nenhum produto encontrado"
        description="Cadastre o primeiro produto para começar."
      />
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead className="text-center">Estoque Mínimo</TableHead>
              <TableHead className="text-center">Ativo</TableHead>
              <TableHead className="w-[60px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  <div>
                    <p>{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-xs">
                        {product.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {product.category}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={product.type === "MATERIAL" ? "default" : "secondary"}
                    className={
                      product.type === "MATERIAL"
                        ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                        : "bg-orange-100 text-orange-800 hover:bg-orange-100"
                    }
                  >
                    {typeLabel[product.type]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {unitLabel[product.unit]}
                </TableCell>
                <TableCell className="text-center">
                  {product.minimumStock > 0 ? (
                    <Badge variant="outline">{product.minimumStock}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {product.isActive ? (
                    <Badge variant="default">Ativo</Badge>
                  ) : (
                    <Badge variant="outline">Inativo</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={loadingId === product.id}
                      >
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/catalogo/produtos/${product.id}/editar`}>
                          <Pencil className="size-4 mr-2" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleToggleActive(product.id)}
                      >
                        <ToggleLeft className="size-4 mr-2" />
                        {product.isActive ? "Desativar" : "Ativar"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(product.id)}
                      >
                        <Trash2 className="size-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Excluir produto"
        description="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        loading={loadingId === deleteId}
        variant="destructive"
      />
    </>
  )
}
