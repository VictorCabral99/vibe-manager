"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import type { AlertListItem } from "@/domains/operacao/queries"
import {
  ShieldAlert,
  AlertTriangle,
  Activity,
  Info,
  Clock,
  User,
  FolderOpen,
  Package,
  RotateCcw,
  Maximize2,
} from "lucide-react"

// ─────────────────────────────────────────────
// Config de prioridade
// ─────────────────────────────────────────────

type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"

const priorityConfig: Record<
  Priority,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    cardBg: string
    border: string
    titleColor: string
    badgeBg: string
    pulse: boolean
  }
> = {
  CRITICAL: {
    label: "CRÍTICO",
    icon: ShieldAlert,
    cardBg: "bg-red-950/80 backdrop-blur",
    border: "border-red-500",
    titleColor: "text-red-300",
    badgeBg: "bg-red-600",
    pulse: true,
  },
  HIGH: {
    label: "ALTO",
    icon: AlertTriangle,
    cardBg: "bg-orange-950/80 backdrop-blur",
    border: "border-orange-500",
    titleColor: "text-orange-300",
    badgeBg: "bg-orange-600",
    pulse: true,
  },
  MEDIUM: {
    label: "MÉDIO",
    icon: Activity,
    cardBg: "bg-yellow-950/60 backdrop-blur",
    border: "border-yellow-600",
    titleColor: "text-yellow-300",
    badgeBg: "bg-yellow-600",
    pulse: false,
  },
  LOW: {
    label: "BAIXO",
    icon: Info,
    cardBg: "bg-slate-900/80 backdrop-blur",
    border: "border-slate-600",
    titleColor: "text-slate-300",
    badgeBg: "bg-slate-600",
    pulse: false,
  },
}

// ─────────────────────────────────────────────
// Formatters
// ─────────────────────────────────────────────

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s atrás`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}min atrás`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h atrás`
  return `${Math.floor(hours / 24)}d atrás`
}

// ─────────────────────────────────────────────
// Alert Card
// ─────────────────────────────────────────────

function AlertCard({ alert }: { alert: AlertListItem }) {
  const config = priorityConfig[alert.priority as Priority]
  const Icon = config.icon

  return (
    <div
      className={`
        rounded-xl border-2 p-5 relative overflow-hidden
        ${config.cardBg} ${config.border}
        ${config.pulse ? "animate-pulse-border" : ""}
        transition-all duration-300
      `}
    >
      {/* Glow effect for critical */}
      {alert.priority === "CRITICAL" && (
        <div className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: "0 0 30px rgba(239,68,68,0.3) inset",
          }}
        />
      )}
      {alert.priority === "HIGH" && (
        <div className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: "0 0 20px rgba(249,115,22,0.2) inset",
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {/* Ping indicator */}
          {config.pulse && (
            <span className="relative flex size-3 shrink-0">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  alert.priority === "CRITICAL" ? "bg-red-400" : "bg-orange-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full size-3 ${
                  alert.priority === "CRITICAL" ? "bg-red-500" : "bg-orange-500"
                }`}
              />
            </span>
          )}
          <span
            className={`
              text-xs font-bold px-2 py-0.5 rounded-full text-white
              ${config.badgeBg}
            `}
          >
            {config.label}
          </span>
        </div>
        <Icon className={`size-5 shrink-0 ${config.titleColor}`} />
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-white leading-tight mb-2">
        {alert.title}
      </h3>

      {/* Description */}
      {alert.description && (
        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
          {alert.description}
        </p>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        {alert.assignedTo && (
          <span className="flex items-center gap-1.5 bg-gray-800/50 rounded-full px-2 py-1">
            <User className="size-3 text-blue-400" />
            <span className="text-blue-300 font-medium">{alert.assignedTo.name}</span>
          </span>
        )}
        {alert.project && (
          <span className="flex items-center gap-1.5 bg-gray-800/50 rounded-full px-2 py-1">
            <FolderOpen className="size-3 text-purple-400" />
            <span className="text-purple-300">{alert.project.name}</span>
          </span>
        )}
        {alert.product && (
          <span className="flex items-center gap-1.5 bg-gray-800/50 rounded-full px-2 py-1">
            <Package className="size-3 text-green-400" />
            <span className="text-green-300">{alert.product.name}</span>
          </span>
        )}
        <span className="flex items-center gap-1.5 bg-gray-800/50 rounded-full px-2 py-1 ml-auto">
          <Clock className="size-3" />
          {timeAgo(alert.createdAt)}
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Display Board
// ─────────────────────────────────────────────

interface DisplayBoardProps {
  initialAlerts: AlertListItem[]
}

export function DisplayBoard({ initialAlerts }: DisplayBoardProps) {
  const router = useRouter()
  const [alerts, setAlerts] = useState(initialAlerts)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isFullscreen, setIsFullscreen] = useState(false)

  const criticals = alerts.filter((a) => a.priority === "CRITICAL")
  const highs = alerts.filter((a) => a.priority === "HIGH")
  const mediums = alerts.filter((a) => a.priority === "MEDIUM")
  const lows = alerts.filter((a) => a.priority === "LOW")

  const refresh = useCallback(() => {
    router.refresh()
    setLastUpdated(new Date())
  }, [router])

  // Auto-refresh a cada 30s
  useEffect(() => {
    const interval = setInterval(refresh, 30000)
    return () => clearInterval(interval)
  }, [refresh])

  // Atualiza alerts quando o server component revalida
  useEffect(() => {
    setAlerts(initialAlerts)
  }, [initialAlerts])

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const now = new Date()
  const timeStr = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })
  const dateStr = now.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  })

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* ── Topbar ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Painel Operacional
          </h1>
          <p className="text-gray-500 mt-1 capitalize">{dateStr}</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Contadores */}
          <div className="flex items-center gap-3">
            {criticals.length > 0 && (
              <div className="flex items-center gap-2 bg-red-950/80 border border-red-700 rounded-lg px-3 py-2">
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-2 bg-red-500" />
                </span>
                <span className="text-red-300 font-bold text-lg">{criticals.length}</span>
                <span className="text-red-500 text-xs">críticos</span>
              </div>
            )}
            {highs.length > 0 && (
              <div className="flex items-center gap-2 bg-orange-950/60 border border-orange-700 rounded-lg px-3 py-2">
                <span className="text-orange-300 font-bold text-lg">{highs.length}</span>
                <span className="text-orange-600 text-xs">altos</span>
              </div>
            )}
          </div>

          {/* Relógio */}
          <div className="text-right">
            <div className="text-3xl font-mono font-bold text-white tabular-nums">
              {timeStr}
            </div>
            <div className="text-xs text-gray-600 mt-0.5">
              Atualizado {lastUpdated.toLocaleTimeString("pt-BR")}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2">
            <button
              onClick={refresh}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              title="Atualizar agora"
            >
              <RotateCcw className="size-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              title="Tela cheia"
            >
              <Maximize2 className="size-5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Sem alertas ── */}
      {alerts.length === 0 && (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <div className="size-24 rounded-full bg-green-950/50 border-2 border-green-700 flex items-center justify-center">
            <Activity className="size-12 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-green-400">Tudo em ordem</h2>
          <p className="text-gray-500">Nenhum alerta ativo no momento</p>
        </div>
      )}

      {/* ── Grid de alertas ── */}
      {alerts.length > 0 && (
        <div className="space-y-8">
          {/* Críticos - destaque máximo */}
          {criticals.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <ShieldAlert className="size-7 text-red-500" />
                  <span className="absolute -top-1 -right-1 flex size-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full size-3 bg-red-600" />
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-red-400 uppercase tracking-wide">
                  Alertas Críticos
                </h2>
                <div className="h-px flex-1 bg-red-900/60" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {criticals.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </section>
          )}

          {/* Altos */}
          {highs.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="size-6 text-orange-500" />
                <h2 className="text-xl font-bold text-orange-400 uppercase tracking-wide">
                  Prioridade Alta
                </h2>
                <div className="h-px flex-1 bg-orange-900/40" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {highs.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </section>
          )}

          {/* Médios e Baixos - colapsados */}
          {(mediums.length > 0 || lows.length > 0) && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Activity className="size-5 text-yellow-600" />
                <h2 className="text-lg font-bold text-yellow-600 uppercase tracking-wide">
                  Outros Alertas
                </h2>
                <div className="h-px flex-1 bg-gray-800" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                {[...mediums, ...lows].map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ── Rodapé ── */}
      <div className="mt-12 flex items-center justify-between text-gray-700 text-xs">
        <span>Total de alertas ativos: {alerts.length}</span>
        <a
          href="/operacao"
          className="hover:text-gray-500 transition-colors"
        >
          ← Voltar ao painel de gestão
        </a>
      </div>
    </div>
  )
}
