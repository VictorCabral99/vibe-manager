import { NextResponse } from "next/server"
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import React, { type ReactElement } from "react"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { QuoteStatus } from "@prisma/client"
import {
  OverdueReportDocument,
  type OverdueReportData,
  type OverdueQuoteItem,
} from "@/lib/pdf/overdue-report-document"

const COMPANY_NAME = process.env.COMPANY_NAME ?? "Empresa"

function daysOverdue(createdAt: Date): number {
  const diffMs = Date.now() - new Date(createdAt).getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

const quoteInclude = {
  client: { select: { id: true, name: true, email: true, phone: true } },
  items:    { select: { total: true } },
  services: { select: { total: true } },
} as const

function calcTotal(
  q: { applyFee: boolean; items: { total: { toNumber(): number } }[]; services: { total: { toNumber(): number } }[] }
): number {
  const sub =
    q.items.reduce((s, i) => s + i.total.toNumber(), 0) +
    q.services.reduce((s, sv) => s + sv.total.toNumber(), 0)
  return q.applyFee ? sub / (1 - 0.15) : sub
}

export async function GET(): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Orçamentos PENDING > 30 dias
  const pendingRaw = await prisma.quote.findMany({
    where: { deletedAt: null, status: QuoteStatus.PENDING, createdAt: { lt: thirtyDaysAgo } },
    include: quoteInclude,
    orderBy: { createdAt: "asc" },
  })
  const pendingQuotes: OverdueQuoteItem[] = pendingRaw.map((q) => ({
    id: q.id,
    createdAt: q.createdAt,
    client: q.client,
    daysOverdue: daysOverdue(q.createdAt),
    totalAmount: calcTotal(q),
  }))

  // Orçamentos APPROVED > 30 dias (inadimplentes de fato)
  const approvedRaw = await prisma.quote.findMany({
    where: { deletedAt: null, status: QuoteStatus.APPROVED, createdAt: { lt: thirtyDaysAgo } },
    include: quoteInclude,
    orderBy: { createdAt: "asc" },
  })
  const approvedQuotes: OverdueQuoteItem[] = approvedRaw.map((q) => ({
    id: q.id,
    createdAt: q.createdAt,
    client: q.client,
    daysOverdue: daysOverdue(q.createdAt),
    totalAmount: calcTotal(q),
  }))

  const reportData: OverdueReportData = {
    generatedAt: new Date(),
    companyName: COMPANY_NAME,
    pendingQuotes,
    approvedQuotes,
  }

  const element = React.createElement(
    OverdueReportDocument,
    { data: reportData }
  ) as unknown as ReactElement<DocumentProps>

  const buffer = await renderToBuffer(element)

  const dateStr = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "")

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="inadimplentes-${dateStr}.pdf"`,
    },
  })
}
