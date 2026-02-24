"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

const REFRESH_INTERVAL_MS = 30_000

export function DashboardRefresher() {
  const router = useRouter()

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, REFRESH_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [router])

  return null
}
