"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { closeProjectAction } from "@/domains/projetos/actions"
import { CheckCircle } from "lucide-react"

interface CloseProjectButtonProps {
  projectId: string
}

export function CloseProjectButton({ projectId }: CloseProjectButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleClose() {
    setLoading(true)
    const result = await closeProjectAction(projectId)
    setLoading(false)

    if (!result.success) {
      toast.error(result.error ?? "Erro ao encerrar projeto")
      return
    }

    toast.success("Projeto encerrado com sucesso!")
    setOpen(false)
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <CheckCircle className="size-4 mr-2" />
        Encerrar Projeto
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Encerrar Projeto"
        description="Tem certeza que deseja encerrar este projeto? Esta ação não pode ser desfeita."
        confirmLabel="Encerrar"
        onConfirm={handleClose}
        loading={loading}
        variant="default"
      />
    </>
  )
}
