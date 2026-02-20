import { NextResponse } from "next/server"
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import React, { type ReactElement } from "react"
import { auth } from "@/auth"
import {
  findPendingQuotesOlderThan30Days,
  findOverdueClients,
} from "@/domains/comercial/orcamentos/queries"
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

export async function GET(): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Orçamentos PENDING > 30 dias
  const pendingRaw = await findPendingQuotesOlderThan30Days()
  const pendingQuotes: OverdueQuoteItem[] = pendingRaw.map((q) => ({
    id: q.id,
    createdAt: q.createdAt,
    client: q.client,
    daysOverdue: daysOverdue(q.createdAt),
  }))

  // Orçamentos APPROVED > 30 dias (inadimplentes de fato)
  const approvedRaw = await prisma.quote.findMany({
    where: {
      deletedAt: null,
      status: QuoteStatus.APPROVED,
      createdAt: { lt: thirtyDaysAgo },
    },
    include: {
      client: { select: { id: true, name: true, email: true, phone: true } },
    },
    orderBy: { createdAt: "asc" },
  })
  const approvedQuotes: OverdueQuoteItem[] = approvedRaw.map((q) => ({
    id: q.id,
    createdAt: q.createdAt,
    client: q.client,
    daysOverdue: daysOverdue(q.createdAt),
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
