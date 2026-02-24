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
import { createClientAction } from "@/domains/pessoas/clientes/actions"

interface QuickCreateClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (client: { id: string; name: string }) => void
}

export function QuickCreateClientDialog({
  open,
  onOpenChange,
  onCreated,
}: QuickCreateClientDialogProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)

  function reset() {
    setName("")
    setEmail("")
    setPhone("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Nome é obrigatório")
      return
    }
    setLoading(true)
    const result = await createClientAction({
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
    })
    setLoading(false)

    if (!result.success) {
      toast.error(result.error ?? "Erro ao criar cliente")
      return
    }

    toast.success("Cliente criado!")
    onCreated({ id: result.data!.id, name: name.trim() })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!loading) { reset(); onOpenChange(o) } }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qcc-name">Nome *</Label>
            <Input
              id="qcc-name"
              placeholder="Nome do cliente"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qcc-email">E-mail</Label>
            <Input
              id="qcc-email"
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qcc-phone">Telefone</Label>
            <Input
              id="qcc-phone"
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
              {loading ? "Criando..." : "Criar Cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
