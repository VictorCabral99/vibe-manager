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
    borderBottomColor: "#dc2626",
  },
  companyName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#dc2626",
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

  // Resumo
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fef2f2",
    borderRadius: 4,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#dc2626",
  },
  summaryLabel: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#dc2626",
  },
  summaryDesc: {
    fontSize: 8,
    color: "#9ca3af",
    marginTop: 1,
  },

  // Tabela
  tableTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
    marginBottom: 8,
  },
  table: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#fee2e2",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    backgroundColor: "#fafafa",
  },
  tableRowLast: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  thName: { flex: 2, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#7f1d1d" },
  thContact: { flex: 2, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#7f1d1d" },
  thDate: { flex: 1, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#7f1d1d" },
  thValue: { flex: 1, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#7f1d1d", textAlign: "right" },
  thDays: { flex: 1, fontSize: 8, fontFamily: "Helvetica-Bold", color: "#7f1d1d", textAlign: "right" },

  tdName: { flex: 2, fontSize: 9, color: "#111827", fontFamily: "Helvetica-Bold" },
  tdContact: { flex: 2, fontSize: 8, color: "#4b5563" },
  tdDate: { flex: 1, fontSize: 9, color: "#6b7280" },
  tdValue: { flex: 1, fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1d4ed8", textAlign: "right" },
  tdDays: { flex: 1, fontSize: 9, fontFamily: "Helvetica-Bold", color: "#dc2626", textAlign: "right" },

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

export interface OverdueQuoteItem {
  id: string
  createdAt: Date
  client: {
    name: string
    email?: string | null
    phone?: string | null
  }
  daysOverdue: number
  totalAmount: number
}

export interface OverdueReportData {
  generatedAt: Date
  companyName: string
  pendingQuotes: OverdueQuoteItem[] // PENDING > 30 dias
  approvedQuotes: OverdueQuoteItem[] // APPROVED > 30 dias (inadimplentes)
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

// ─────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────

function QuoteTable({
  title,
  items,
}: {
  title: string
  items: OverdueQuoteItem[]
}) {
  if (items.length === 0) return null

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.tableTitle}>{title}</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.thName}>Cliente</Text>
          <Text style={styles.thContact}>Contato</Text>
          <Text style={styles.thDate}>Data Orçamento</Text>
          <Text style={styles.thValue}>Valor</Text>
          <Text style={styles.thDays}>Em atraso</Text>
        </View>
        {items.map((item, i) => (
          <View
            key={item.id}
            style={
              i === items.length - 1
                ? styles.tableRowLast
                : i % 2 === 0
                ? styles.tableRow
                : styles.tableRowAlt
            }
          >
            <Text style={styles.tdName}>{item.client.name}</Text>
            <View style={styles.tdContact}>
              {item.client.phone && <Text>{item.client.phone}</Text>}
              {item.client.email && (
                <Text style={{ color: "#6b7280" }}>{item.client.email}</Text>
              )}
            </View>
            <Text style={styles.tdDate}>{fmtDate(item.createdAt)}</Text>
            <Text style={styles.tdValue}>{fmtCurrency(item.totalAmount)}</Text>
            <Text style={styles.tdDays}>{item.daysOverdue}d</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export function OverdueReportDocument({ data }: { data: OverdueReportData }) {
  const totalOverdue = data.pendingQuotes.length + data.approvedQuotes.length
  const totalAtRisk =
    [...data.pendingQuotes, ...data.approvedQuotes].reduce((s, q) => s + q.totalAmount, 0)

  return (
    <Document title="Relatório de Inadimplentes" author={data.companyName}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{data.companyName}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.reportTitle}>Relatório de Inadimplentes</Text>
            <Text style={styles.reportDate}>
              Gerado em: {fmtDate(data.generatedAt)}
            </Text>
          </View>
        </View>

        {/* Resumo */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total de orçamentos</Text>
            <Text style={styles.summaryValue}>{totalOverdue}</Text>
            <Text style={styles.summaryDesc}>em atraso (+30 dias)</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Pendentes aprovação</Text>
            <Text style={styles.summaryValue}>{data.pendingQuotes.length}</Text>
            <Text style={styles.summaryDesc}>aguardando resposta do cliente</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Aprovados não pagos</Text>
            <Text style={styles.summaryValue}>{data.approvedQuotes.length}</Text>
            <Text style={styles.summaryDesc}>aceitos mas sem pagamento</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: "#1d4ed8", backgroundColor: "#eff6ff" }]}>
            <Text style={[styles.summaryLabel, { color: "#1e3a8a" }]}>Valor em risco</Text>
            <Text style={[styles.summaryValue, { fontSize: 13, color: "#1d4ed8" }]}>
              {fmtCurrency(totalAtRisk)}
            </Text>
            <Text style={styles.summaryDesc}>total dos orçamentos em aberto</Text>
          </View>
        </View>

        {/* Tabelas */}
        <QuoteTable
          title="Aprovados Sem Pagamento (Inadimplentes)"
          items={data.approvedQuotes}
        />
        <QuoteTable
          title="Pendentes de Aprovação (+30 dias)"
          items={data.pendingQuotes}
        />

        {totalOverdue === 0 && (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 40,
            }}
          >
            <Text style={{ fontSize: 14, color: "#16a34a", fontFamily: "Helvetica-Bold" }}>
              Parabéns! Nenhum inadimplente no momento.
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {data.companyName} • Relatório de Inadimplentes
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
