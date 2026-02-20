import type { LucideIcon } from "lucide-react"
import { Inbox } from "lucide-react"

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: LucideIcon
}

export function EmptyState({
  title = "Nenhum registro encontrado",
  description = "Crie o primeiro registro para começar.",
  icon: Icon = Inbox,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="size-12 text-muted-foreground/40 mb-4" />
      <h3 className="font-medium text-muted-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground/70 mt-1">{description}</p>
    </div>
  )
}
