"use client"

import { useState } from "react"
import { MeasurementUnit, ProductType } from "@prisma/client"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createProductAction } from "@/domains/catalogo/produtos/actions"

const UNIT_LABELS: Record<MeasurementUnit, string> = {
  UNIT: "Unidade",
  KG: "Kg",
  METER: "Metro",
  LITER: "Litro",
  BOX: "Caixa",
  PACKAGE: "Pacote",
}

interface QuickCreateProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (product: {
    id: string
    name: string
    unit: MeasurementUnit
    category: string
  }) => void
}

export function QuickCreateProductDialog({
  open,
  onOpenChange,
  onCreated,
}: QuickCreateProductDialogProps) {
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [unit, setUnit] = useState<MeasurementUnit>("UNIT")
  const [type, setType] = useState<ProductType>("MATERIAL")
  const [loading, setLoading] = useState(false)

  function reset() {
    setName("")
    setCategory("")
    setUnit("UNIT")
    setType("MATERIAL")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !category.trim()) {
      toast.error("Nome e categoria são obrigatórios")
      return
    }
    setLoading(true)
    const result = await createProductAction({
      name: name.trim(),
      category: category.trim(),
      unit,
      type,
      minimumStock: 0,
      isActive: true,
    })
    setLoading(false)

    if (!result.success) {
      toast.error(result.error ?? "Erro ao criar produto")
      return
    }

    toast.success("Produto criado!")
    onCreated({ id: result.data!.id, name: name.trim(), unit, category: category.trim() })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!loading) { reset(); onOpenChange(o) } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Novo Produto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qcp-name">Nome *</Label>
            <Input
              id="qcp-name"
              placeholder="Nome do produto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qcp-category">Categoria *</Label>
            <Input
              id="qcp-category"
              placeholder="Ex: Materiais de construção"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Unidade</Label>
              <Select value={unit} onValueChange={(v) => setUnit(v as MeasurementUnit)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(UNIT_LABELS).map(([v, label]) => (
                    <SelectItem key={v} value={v}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v) => setType(v as ProductType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MATERIAL">Material</SelectItem>
                  <SelectItem value="TOOL">Ferramenta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { reset(); onOpenChange(false) }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Produto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
