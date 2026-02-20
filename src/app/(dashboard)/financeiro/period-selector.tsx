"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useCallback } from "react"

type Period = "day" | "week" | "month"

const periodLabels: Record<Period, string> = {
  day: "Por Dia",
  week: "Por Semana",
  month: "Por Mês",
}

interface PeriodSelectorProps {
  current: Period
}

export function PeriodSelector({ current }: PeriodSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setParam = useCallback(
    (period: Period) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("period", period)
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="flex gap-1 rounded-lg border p-1 bg-muted/50">
      {(["day", "week", "month"] as Period[]).map((p) => (
        <button
          key={p}
          onClick={() => setParam(p)}
          className={`
            px-3 py-1.5 rounded-md text-sm font-medium transition-colors
            ${
              current === p
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }
          `}
        >
          {periodLabels[p]}
        </button>
      ))}
    </div>
  )
}
