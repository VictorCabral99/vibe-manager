"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { BuyerItem } from "@/domains/compras/queries"
import { X } from "lucide-react"

interface PurchaseFiltersProps {
  buyers: BuyerItem[]
}

export function PurchaseFilters({ buyers }: PurchaseFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const buyerId = searchParams.get("buyerId") ?? ""
  const fromDate = searchParams.get("fromDate") ?? ""
  const toDate = searchParams.get("toDate") ?? ""

  const hasFilters = buyerId || fromDate || toDate

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/compras?${params.toString()}`)
    },
    [router, searchParams]
  )

  function clearFilters() {
    router.push("/compras")
  }

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <Select
        value={buyerId}
        onValueChange={(value) => updateParam("buyerId", value === "all" ? "" : value)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Filtrar por comprador" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos compradores</SelectItem>
          {buyers.map((buyer) => (
            <SelectItem key={buyer.id} value={buyer.id}>
              {buyer.user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        className="w-40"
        value={fromDate}
        onChange={(e) => updateParam("fromDate", e.target.value)}
        placeholder="De"
      />

      <Input
        type="date"
        className="w-40"
        value={toDate}
        onChange={(e) => updateParam("toDate", e.target.value)}
        placeholder="Até"
      />

      {hasFilters && (
        <Button variant="ghost" size="icon" onClick={clearFilters}>
          <X className="size-4" />
        </Button>
      )}
    </div>
  )
}
