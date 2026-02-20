"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ExternalPayableForm } from "./external-payable-form"

export function FinanceiroActionsBar() {
  const [openForm, setOpenForm] = useState(false)

  return (
    <>
      <Button onClick={() => setOpenForm(true)}>
        <Plus className="size-4 mr-2" />
        Nova Conta a Pagar
      </Button>

      <ExternalPayableForm open={openForm} onOpenChange={setOpenForm} />
    </>
  )
}
