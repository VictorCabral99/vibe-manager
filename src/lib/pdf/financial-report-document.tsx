import React from "react"
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
    color: "#1a1a1a",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
  },
  companyName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#2563eb",
  },
  reportTitle: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
  },
  reportDate: {
    fontSize: 9,
    color: "#9ca3af",
    marginTop: 2,
  },

  // Cards resumo
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  cardGreen: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    borderRadius: 4,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#16a34a",
  },
  cardRed: {
    flex: 1,
    backgroundColor: "#fef2f2",
    borderRadius: 4,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#dc2626",
  },
  cardBlue: {
    flex: 1,
    backgroundColor: "#eff6ff",
    borderRadius: 4,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#2563eb",
  },
  cardAmber: {
    flex: 1,
    backgroundColor: "#fffbeb",
    borderRadius: 4,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#d97706",
  },
  cardLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  cardValueGreen: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#16a34a" },
  cardValueRed: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#dc2626" },
  cardValueBlue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#2563eb" },
  cardValueAmber: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#d97706" },

  // Tabela
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
    marginBottom: 8,
    marginTop: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  tableHeaderIn: {
    flexDirection: "row",
    backgroundColor: "#dcfce7",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableHeaderOut: {
    flexDirection: "row",
    backgroundColor: "#fee2e2",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    backgroundColor: "#fafafa",
  },
  tableRowLast: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },

  thDesc: { flex: 3, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#374151" },
  thDate: { flex: 1, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#374151" },
  thStatus: { flex: 1, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#374151" },
  thValue: { flex: 1, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#374151", textAlign: "right" },

  tdDesc: { flex: 3, fontSize: 8, color: "#111827" },
  tdDate: { flex: 1, fontSize: 8, color: "#6b7280" },
  tdStatus: { flex: 1, fontSize: 8, color: "#6b7280" },
  tdValueIn: { flex: 1, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#16a34a", textAlign: "right" },
  tdValueOut: { flex: 1, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#dc2626", textAlign: "right" },

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
  footerText: { fontSize: 8, color: "#9ca3af" },
})

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

export interface FinancialReportEntry {
  id: string
  description: string
  amount: number
  direction: "IN" | "OUT"
  status: "PENDING" | "PAID" | "OVERDUE"
  dueDate: Date
  paidAt?: Date | null
}

export interface FinancialReportData {
  companyName: string
  generatedAt: Date
  period: string
  summary: {
    totalReceivable: number
    totalPayable: number
    projectedBalance: number
    netThisMonth: number
  }
  receivables: FinancialReportEntry[]
  payables: FinancialReportEntry[]
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function fmtDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(date))
}

function fmtCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  OVERDUE: "Vencido",
}

// ─────────────────────────────────────────────
// Sub-componentes
// ─────────────────────────────────────────────

function EntriesTable({
  entries,
  direction,
}: {
  entries: FinancialReportEntry[]
  direction: "IN" | "OUT"
}) {
  if (entries.length === 0) {
    return (
      <View style={{ paddingVertical: 8 }}>
        <Text style={{ fontSize: 9, color: "#9ca3af" }}>Nenhum lançamento no período.</Text>
      </View>
    )
  }

  return (
    <View style={styles.table}>
      <View style={direction === "IN" ? styles.tableHeaderIn : styles.tableHeaderOut}>
        <Text style={styles.thDesc}>Descrição</Text>
        <Text style={styles.thDate}>Vencimento</Text>
        <Text style={styles.thDate}>Pagamento</Text>
        <Text style={styles.thStatus}>Status</Text>
        <Text style={styles.thValue}>Valor</Text>
      </View>
      {entries.map((e, i) => (
        <View
          key={e.id}
          style={
            i === entries.length - 1
              ? styles.tableRowLast
              : i % 2 === 0
              ? styles.tableRow
              : styles.tableRowAlt
          }
        >
          <Text style={styles.tdDesc}>{e.description}</Text>
          <Text style={styles.tdDate}>{fmtDate(e.dueDate)}</Text>
          <Text style={styles.tdDate}>{e.paidAt ? fmtDate(e.paidAt) : "—"}</Text>
          <Text style={styles.tdStatus}>{statusLabels[e.status] ?? e.status}</Text>
          <Text style={direction === "IN" ? styles.tdValueIn : styles.tdValueOut}>
            {fmtCurrency(e.amount)}
          </Text>
        </View>
      ))}
    </View>
  )
}

// ─────────────────────────────────────────────
// Documento principal
// ─────────────────────────────────────────────

export function FinancialReportDocument({ data }: { data: FinancialReportData }) {
  const { summary, receivables, payables } = data

  return (
    <Document title="Relatório Financeiro" author={data.companyName}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{data.companyName}</Text>
            <Text style={{ fontSize: 9, color: "#6b7280", marginTop: 2 }}>
              Período: {data.period}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.reportTitle}>Relatório Financeiro</Text>
            <Text style={styles.reportDate}>
              Gerado em: {fmtDate(data.generatedAt)}
            </Text>
          </View>
        </View>

        {/* Cards resumo */}
        <View style={styles.summaryRow}>
          <View style={styles.cardGreen}>
            <Text style={styles.cardLabel}>A Receber</Text>
            <Text style={styles.cardValueGreen}>{fmtCurrency(summary.totalReceivable)}</Text>
          </View>
          <View style={styles.cardRed}>
            <Text style={styles.cardLabel}>A Pagar</Text>
            <Text style={styles.cardValueRed}>{fmtCurrency(summary.totalPayable)}</Text>
          </View>
          <View style={styles.cardBlue}>
            <Text style={styles.cardLabel}>Saldo Projetado</Text>
            <Text style={styles.cardValueBlue}>{fmtCurrency(summary.projectedBalance)}</Text>
          </View>
          <View style={styles.cardAmber}>
            <Text style={styles.cardLabel}>Resultado do Mês</Text>
            <Text style={styles.cardValueAmber}>{fmtCurrency(summary.netThisMonth)}</Text>
          </View>
        </View>

        {/* Tabela A Receber */}
        <Text style={styles.sectionTitle}>
          Contas a Receber ({receivables.length})
        </Text>
        <EntriesTable entries={receivables} direction="IN" />

        {/* Tabela A Pagar */}
        <Text style={styles.sectionTitle}>
          Contas a Pagar ({payables.length})
        </Text>
        <EntriesTable entries={payables} direction="OUT" />

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {data.companyName} • Relatório Financeiro
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
