import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer"

// ─────────────────────────────────────────────
// Estilos
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    color: "#1a1a1a",
    backgroundColor: "#ffffff",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
  },
  companyBlock: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#2563eb",
    marginBottom: 2,
  },
  companyInfo: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 1,
  },
  quoteBlock: {
    alignItems: "flex-end",
  },
  quoteTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
  },
  quoteNumber: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 2,
  },
  quoteDate: {
    fontSize: 9,
    color: "#9ca3af",
    marginTop: 1,
  },

  // Client section
  sectionRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  clientCard: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderRadius: 4,
    padding: 10,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 2,
  },
  clientDetail: {
    fontSize: 9,
    color: "#4b5563",
    marginTop: 1,
  },

  // Table
  tableContainer: {
    marginBottom: 16,
  },
  tableTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
    marginBottom: 6,
  },
  table: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  tableRowLast: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  thDesc: {
    flex: 3,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
  },
  thNum: {
    flex: 1,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    textAlign: "right",
  },
  tdDesc: {
    flex: 3,
    fontSize: 9,
    color: "#374151",
  },
  tdNum: {
    flex: 1,
    fontSize: 9,
    color: "#374151",
    textAlign: "right",
  },
  tdNumBold: {
    flex: 1,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    textAlign: "right",
  },

  // Totals
  totalsWrapper: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 16,
  },
  totalsBox: {
    width: 220,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalsRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    marginTop: 4,
    borderTopWidth: 2,
    borderTopColor: "#2563eb",
  },
  totalsLabel: {
    fontSize: 9,
    color: "#6b7280",
  },
  totalsValue: {
    fontSize: 9,
    color: "#374151",
    fontFamily: "Helvetica-Bold",
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  totalValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#2563eb",
  },

  // Notes
  notesBox: {
    backgroundColor: "#fefce8",
    borderRadius: 4,
    padding: 10,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#fbbf24",
  },
  notesText: {
    fontSize: 9,
    color: "#78350f",
    lineHeight: 1.4,
  },

  // Payment
  paymentSection: {
    flexDirection: "row",
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 16,
    marginTop: 8,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
    marginBottom: 8,
  },
  paymentRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  paymentKey: {
    fontSize: 9,
    color: "#6b7280",
    width: 70,
  },
  paymentVal: {
    fontSize: 9,
    color: "#111827",
    fontFamily: "Helvetica-Bold",
    flex: 1,
  },
  pixKeyHighlight: {
    backgroundColor: "#eff6ff",
    borderRadius: 3,
    padding: "2 6",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1d4ed8",
    marginTop: 6,
  },
  qrBlock: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  qrLabel: {
    fontSize: 8,
    color: "#6b7280",
    textAlign: "center",
  },
  qrImage: {
    width: 110,
    height: 110,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
  },
})

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

export interface QuotePDFItem {
  name: string
  unit: string
  quantity: number
  unitPrice: number
  total: number
}

export interface QuotePDFService {
  name: string
  description?: string | null
  quantity: number
  unitPrice: number
  total: number
}

export interface QuotePDFData {
  id: string
  createdAt: Date
  client: {
    name: string
    email?: string | null
    phone?: string | null
    document?: string | null
    address?: string | null
  }
  items: QuotePDFItem[]
  services: QuotePDFService[]
  applyFee: boolean
  notes?: string | null
  totals: {
    subtotalItems: number
    subtotalServices: number
    subtotal: number
    fee: number
    total: number
  }
  // Dados de pagamento
  pixKey: string
  pixQrCodeDataUrl: string
  companyName: string
  companyCnpj?: string
  companyPhone?: string
  companyEmail?: string
  bankName?: string
  bankAgency?: string
  bankAccount?: string
  bankAccountType?: string
}

// ─────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────

function fmt(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function fmtDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR").format(date)
}

function fmtQty(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/\.?0+$/, "")
}

// ─────────────────────────────────────────────
// Componente PDF
// ─────────────────────────────────────────────

export function QuotePDFDocument({ data }: { data: QuotePDFData }) {
  const quoteRef = `#${data.id.slice(-8).toUpperCase()}`

  return (
    <Document title={`Orçamento ${quoteRef}`} author={data.companyName}>
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.companyBlock}>
            <Text style={styles.companyName}>{data.companyName}</Text>
            {data.companyCnpj && (
              <Text style={styles.companyInfo}>CNPJ: {data.companyCnpj}</Text>
            )}
            {data.companyPhone && (
              <Text style={styles.companyInfo}>Tel: {data.companyPhone}</Text>
            )}
            {data.companyEmail && (
              <Text style={styles.companyInfo}>{data.companyEmail}</Text>
            )}
          </View>
          <View style={styles.quoteBlock}>
            <Text style={styles.quoteTitle}>ORÇAMENTO</Text>
            <Text style={styles.quoteNumber}>{quoteRef}</Text>
            <Text style={styles.quoteDate}>
              Data: {fmtDate(data.createdAt)}
            </Text>
          </View>
        </View>

        {/* ── Cliente ── */}
        <View style={styles.sectionRow}>
          <View style={styles.clientCard}>
            <Text style={styles.sectionLabel}>Para</Text>
            <Text style={styles.clientName}>{data.client.name}</Text>
            {data.client.document && (
              <Text style={styles.clientDetail}>
                CPF/CNPJ: {data.client.document}
              </Text>
            )}
            {data.client.phone && (
              <Text style={styles.clientDetail}>Tel: {data.client.phone}</Text>
            )}
            {data.client.email && (
              <Text style={styles.clientDetail}>{data.client.email}</Text>
            )}
            {data.client.address && (
              <Text style={styles.clientDetail}>{data.client.address}</Text>
            )}
          </View>
        </View>

        {/* ── Itens ── */}
        {data.items.length > 0 && (
          <View style={styles.tableContainer}>
            <Text style={styles.tableTitle}>Materiais / Produtos</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.thDesc}>Descrição</Text>
                <Text style={styles.thNum}>Un.</Text>
                <Text style={styles.thNum}>Qtd</Text>
                <Text style={styles.thNum}>Unit.</Text>
                <Text style={styles.thNum}>Total</Text>
              </View>
              {data.items.map((item, i) => (
                <View
                  key={i}
                  style={
                    i < data.items.length - 1
                      ? styles.tableRow
                      : styles.tableRowLast
                  }
                >
                  <Text style={styles.tdDesc}>{item.name}</Text>
                  <Text style={styles.tdNum}>{item.unit}</Text>
                  <Text style={styles.tdNum}>{fmtQty(item.quantity)}</Text>
                  <Text style={styles.tdNum}>{fmt(item.unitPrice)}</Text>
                  <Text style={styles.tdNumBold}>{fmt(item.total)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Serviços ── */}
        {data.services.length > 0 && (
          <View style={styles.tableContainer}>
            <Text style={styles.tableTitle}>Serviços</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.thDesc}>Descrição</Text>
                <Text style={styles.thNum}>Qtd</Text>
                <Text style={styles.thNum}>Unit.</Text>
                <Text style={styles.thNum}>Total</Text>
              </View>
              {data.services.map((svc, i) => (
                <View
                  key={i}
                  style={
                    i < data.services.length - 1
                      ? styles.tableRow
                      : styles.tableRowLast
                  }
                >
                  <View style={styles.tdDesc}>
                    <Text>{svc.name}</Text>
                    {svc.description && (
                      <Text style={{ fontSize: 8, color: "#9ca3af", marginTop: 1 }}>
                        {svc.description}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.tdNum}>{fmtQty(svc.quantity)}</Text>
                  <Text style={styles.tdNum}>{fmt(svc.unitPrice)}</Text>
                  <Text style={styles.tdNumBold}>{fmt(svc.total)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Totais ── */}
        <View style={styles.totalsWrapper}>
          <View style={styles.totalsBox}>
            {data.items.length > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Subtotal materiais</Text>
                <Text style={styles.totalsValue}>
                  {fmt(data.totals.subtotalItems)}
                </Text>
              </View>
            )}
            {data.services.length > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Subtotal serviços</Text>
                <Text style={styles.totalsValue}>
                  {fmt(data.totals.subtotalServices)}
                </Text>
              </View>
            )}
            {data.applyFee && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Taxa nota fiscal (15%)</Text>
                <Text style={styles.totalsValue}>{fmt(data.totals.fee)}</Text>
              </View>
            )}
            <View style={styles.totalsRowTotal}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>{fmt(data.totals.total)}</Text>
            </View>
          </View>
        </View>

        {/* ── Observações ── */}
        {data.notes && (
          <View style={styles.notesBox}>
            <Text style={[styles.sectionLabel, { color: "#92400e", marginBottom: 4 }]}>
              Observações
            </Text>
            <Text style={styles.notesText}>{data.notes}</Text>
          </View>
        )}

        {/* ── Pagamento / PIX ── */}
        <View style={styles.paymentSection}>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>Dados de Pagamento</Text>
            {data.bankName && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentKey}>Banco</Text>
                <Text style={styles.paymentVal}>{data.bankName}</Text>
              </View>
            )}
            {data.bankAgency && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentKey}>Agência</Text>
                <Text style={styles.paymentVal}>{data.bankAgency}</Text>
              </View>
            )}
            {data.bankAccount && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentKey}>Conta</Text>
                <Text style={styles.paymentVal}>
                  {data.bankAccount}
                  {data.bankAccountType ? ` (${data.bankAccountType})` : ""}
                </Text>
              </View>
            )}
            <View style={styles.paymentRow}>
              <Text style={styles.paymentKey}>Beneficiário</Text>
              <Text style={styles.paymentVal}>{data.companyName}</Text>
            </View>
            <Text style={styles.pixKeyHighlight}>PIX: {data.pixKey}</Text>
          </View>

          <View style={styles.qrBlock}>
            <Text style={styles.qrLabel}>Pague via PIX</Text>
            <Image src={data.pixQrCodeDataUrl} style={styles.qrImage} />
            <Text style={styles.qrLabel}>Escaneie o QR Code</Text>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {data.companyName} • Orçamento {quoteRef} • {fmtDate(data.createdAt)}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  )
}
