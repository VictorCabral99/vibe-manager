import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import QRCode from "qrcode"
import React, { type ReactElement } from "react"
import { auth } from "@/auth"
import { findQuoteById } from "@/domains/comercial/orcamentos/queries"
import { calculateQuoteTotals } from "@/domains/comercial/orcamentos/calculations"
import { buildPixPayload } from "@/lib/pix"
import { QuotePDFDocument, type QuotePDFData } from "@/lib/pdf/quote-document"

// Configurações da empresa (via variáveis de ambiente ou defaults)
const COMPANY_NAME = process.env.COMPANY_NAME ?? "Empresa"
const COMPANY_CNPJ = process.env.COMPANY_CNPJ
const COMPANY_PHONE = process.env.COMPANY_PHONE
const COMPANY_EMAIL = process.env.COMPANY_EMAIL
const PIX_KEY = process.env.PIX_KEY ?? ""
const PIX_RECIPIENT_NAME = process.env.PIX_RECIPIENT_NAME ?? COMPANY_NAME
const PIX_CITY = process.env.PIX_CITY ?? "SAO PAULO"
const BANK_NAME = process.env.BANK_NAME
const BANK_AGENCY = process.env.BANK_AGENCY
const BANK_ACCOUNT = process.env.BANK_ACCOUNT
const BANK_ACCOUNT_TYPE = process.env.BANK_ACCOUNT_TYPE

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // Autenticação
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params
  const quote = await findQuoteById(id)

  if (!quote) {
    return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 })
  }

  // Calcular totais
  const itemInputs = quote.items.map((i) => ({
    productId: i.productId,
    productName: i.product.name,
    quantity: Number(i.quantity),
    unitPrice: Number(i.unitPrice),
  }))

  const serviceInputs = quote.services.map((s) => ({
    serviceId: s.serviceId,
    serviceName: s.service.name,
    quantity: Number(s.quantity),
    unitPrice: Number(s.unitPrice),
    description: s.description ?? undefined,
  }))

  const totals = calculateQuoteTotals(itemInputs, serviceInputs, quote.applyFee)

  // Gerar QR Code PIX
  let pixQrCodeDataUrl = ""
  if (PIX_KEY) {
    const pixPayload = buildPixPayload({
      pixKey: PIX_KEY,
      recipientName: PIX_RECIPIENT_NAME,
      city: PIX_CITY,
      amount: totals.total,
    })
    pixQrCodeDataUrl = await QRCode.toDataURL(pixPayload, {
      errorCorrectionLevel: "M",
      width: 200,
      margin: 1,
    })
  } else {
    // QR code placeholder se PIX_KEY não configurada
    pixQrCodeDataUrl = await QRCode.toDataURL("Configure PIX_KEY no .env", {
      width: 200,
      margin: 1,
    })
  }

  // Montar dados do PDF
  const pdfData: QuotePDFData = {
    id: quote.id,
    createdAt: quote.createdAt,
    client: {
      name: quote.client.name,
      email: quote.client.email,
      phone: quote.client.phone,
      document: quote.client.document,
      address: quote.client.address,
    },
    items: quote.items.map((i) => ({
      name: i.product.name,
      unit: i.product.unit,
      quantity: Number(i.quantity),
      unitPrice: Number(i.unitPrice),
      total: Number(i.total),
    })),
    services: quote.services.map((s) => ({
      name: s.service.name,
      description: s.description ?? s.service.description,
      quantity: Number(s.quantity),
      unitPrice: Number(s.unitPrice),
      total: Number(s.total),
    })),
    applyFee: quote.applyFee,
    notes: quote.notes,
    totals,
    pixKey: PIX_KEY || "Chave PIX não configurada",
    pixQrCodeDataUrl,
    companyName: COMPANY_NAME,
    companyCnpj: COMPANY_CNPJ,
    companyPhone: COMPANY_PHONE,
    companyEmail: COMPANY_EMAIL,
    bankName: BANK_NAME,
    bankAgency: BANK_AGENCY,
    bankAccount: BANK_ACCOUNT,
    bankAccountType: BANK_ACCOUNT_TYPE,
  }

  // Renderizar PDF
  const element = React.createElement(
    QuotePDFDocument,
    { data: pdfData }
  ) as unknown as ReactElement<DocumentProps>

  const buffer = await renderToBuffer(element)

  const quoteRef = quote.id.slice(-8).toUpperCase()
  const clientSlug = quote.client.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 20)

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="orcamento-${quoteRef}-${clientSlug}.pdf"`,
    },
  })
}
