import { NextResponse } from "next/server"
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import React, { type ReactElement } from "react"
import { auth } from "@/auth"
import { findAllCashFlowEntries, findCashFlowSummary } from "@/domains/financeiro/queries"
import {
  FinancialReportDocument,
  type FinancialReportData,
  type FinancialReportEntry,
} from "@/lib/pdf/financial-report-document"

const COMPANY_NAME = process.env.COMPANY_NAME ?? "Empresa"

const periodLabels: Record<string, string> = {
  day: "Últimos 30 dias",
  week: "Últimas 12 semanas",
  month: "Últimos 12 meses",
}

export async function GET(req: Request): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const period = (searchParams.get("period") ?? "month") as "day" | "week" | "month"

  const [entriesRaw, summary] = await Promise.all([
    findAllCashFlowEntries(),
    findCashFlowSummary(),
  ])

  const toEntry = (e: typeof entriesRaw[number]): FinancialReportEntry => ({
    id: e.id,
    description: e.description,
    amount: Number(e.amount),
    direction: e.direction as "IN" | "OUT",
    status: e.status as "PENDING" | "PAID" | "OVERDUE",
    dueDate: e.dueDate,
    paidAt: e.paidAt,
  })

  const receivables = entriesRaw.filter((e) => e.direction === "IN").map(toEntry)
  const payables = entriesRaw.filter((e) => e.direction === "OUT").map(toEntry)

  const reportData: FinancialReportData = {
    companyName: COMPANY_NAME,
    generatedAt: new Date(),
    period: periodLabels[period] ?? "Geral",
    summary: {
      totalReceivable: summary.totalReceivable,
      totalPayable: summary.totalPayable,
      projectedBalance: summary.projectedBalance,
      netThisMonth: summary.netThisMonth,
    },
    receivables,
    payables,
  }

  const element = React.createElement(
    FinancialReportDocument,
    { data: reportData }
  ) as unknown as ReactElement<DocumentProps>

  const buffer = await renderToBuffer(element)

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "")

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="relatorio-financeiro-${dateStr}.pdf"`,
    },
  })
}
