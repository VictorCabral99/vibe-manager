"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { LogOut, User } from "lucide-react"
import { logoutAction } from "@/domains/auth/actions"
import type { Role } from "@prisma/client"

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  MANAGER: "Gerente",
  EMPLOYEE: "Funcionário",
  VIEWER: "Visualizador",
}

interface AppHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string | null
  }
}

function getInitials(name?: string | null): string {
  if (!name) return "?"
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function AppHeader({ user }: AppHeaderProps) {
  const role = user.role as Role

  return (
    <header className="h-14 border-b flex items-center gap-2 px-4 bg-background">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4" />
      <div className="flex-1" />
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
          <Badge variant="secondary" className="hidden sm:flex">
            {ROLE_LABELS[role] ?? role}
          </Badge>
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground font-normal">{user.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="size-4 mr-2" />
            Meu perfil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => logoutAction()}
          >
            <LogOut className="size-4 mr-2" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
