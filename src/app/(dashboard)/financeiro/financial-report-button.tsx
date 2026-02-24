"use client"

import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FinancialReportButton() {
  function handleDownload() {
    window.open("/api/financeiro/relatorio", "_blank")
  }

  return (
    <Button variant="outline" onClick={handleDownload}>
      <FileText className="size-4 mr-2" />
      Relatório PDF
    </Button>
  )
}
