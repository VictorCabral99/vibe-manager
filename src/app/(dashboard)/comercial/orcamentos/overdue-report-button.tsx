"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { FileWarning } from "lucide-react"

export function OverdueReportButton() {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const response = await fetch("/api/orcamentos/relatorio-inadimplentes")
      if (!response.ok) {
        toast.error("Erro ao gerar relatório")
        return
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "")
      a.download = `inadimplentes-${date}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Relatório gerado com sucesso")
    } catch {
      toast.error("Erro ao gerar relatório")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleDownload} disabled={loading}>
      <FileWarning className="size-4 mr-2" />
      {loading ? "Gerando..." : "Relatório Inadimplentes"}
    </Button>
  )
}
