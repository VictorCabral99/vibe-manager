"use client"

import { useState } from "react"
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
import { createServiceAction } from "@/domains/catalogo/servicos/actions"

interface CreatedService {
  id: string
  name: string
  basePrice: number | null
  description: string | null
}

interface QuickCreateServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (service: CreatedService) => void
}

export function QuickCreateServiceDialog({
  open,
  onOpenChange,
  onCreated,
}: QuickCreateServiceDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [basePrice, setBasePrice] = useState("")
  const [loading, setLoading] = useState(false)

  function reset() {
    setName("")
    setDescription("")
    setBasePrice("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Nome é obrigatório")
      return
    }
    const price = basePrice ? parseFloat(basePrice) : undefined
    setLoading(true)
    const result = await createServiceAction({
      name: name.trim(),
      description: description.trim() || undefined,
      basePrice: price,
      isActive: true,
    })
    setLoading(false)

    if (!result.success) {
      toast.error(result.error ?? "Erro ao criar serviço")
      return
    }

    toast.success("Serviço criado!")
    onCreated({
      id: result.data!.id,
      name: name.trim(),
      basePrice: price !== undefined ? price : null,
      description: description.trim() || null,
    })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!loading) { reset(); onOpenChange(o) } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Novo Serviço</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qcs-name">Nome *</Label>
            <Input
              id="qcs-name"
              placeholder="Nome do serviço"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qcs-price">Preço Base (R$)</Label>
            <Input
              id="qcs-price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qcs-desc">Descrição</Label>
            <Input
              id="qcs-desc"
              placeholder="Descrição do serviço"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
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
              {loading ? "Criando..." : "Criar Serviço"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
