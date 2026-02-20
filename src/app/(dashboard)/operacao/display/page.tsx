import { findAllAlerts } from "@/domains/operacao/queries"
import { DisplayBoard } from "./display-board"

export const revalidate = 30 // revalida a cada 30s

export default async function OperacaoDisplayPage() {
  const alerts = await findAllAlerts("ACTIVE")

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <DisplayBoard initialAlerts={alerts} />
    </div>
  )
}
