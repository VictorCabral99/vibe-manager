"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Users,
  Package,
  Wrench,
  FileText,
  FolderKanban,
  ShoppingCart,
  Warehouse,
  Wallet,
  Bell,
  Settings,
  UserCircle,
  Building2,
} from "lucide-react"
import type { Role } from "@prisma/client"
import { hasRole } from "@/domains/auth/permissions"

interface AppSidebarProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string | null
  }
}

const navigation = [
  {
    label: "Principal",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        requiredRole: "MANAGER" as Role,
      },
    ],
  },
  {
    label: "Pessoas",
    items: [
      {
        title: "Usuários",
        href: "/pessoas/usuarios",
        icon: Settings,
        requiredRole: "MANAGER" as Role,
      },
      {
        title: "Funcionários",
        href: "/pessoas/funcionarios",
        icon: Users,
        requiredRole: "MANAGER" as Role,
      },
      {
        title: "Clientes",
        href: "/pessoas/clientes",
        icon: Building2,
        requiredRole: "EMPLOYEE" as Role,
      },
    ],
  },
  {
    label: "Catálogo",
    items: [
      {
        title: "Produtos",
        href: "/catalogo/produtos",
        icon: Package,
        requiredRole: "VIEWER" as Role,
      },
      {
        title: "Serviços",
        href: "/catalogo/servicos",
        icon: Wrench,
        requiredRole: "VIEWER" as Role,
      },
    ],
  },
  {
    label: "Comercial",
    items: [
      {
        title: "Orçamentos",
        href: "/comercial/orcamentos",
        icon: FileText,
        requiredRole: "EMPLOYEE" as Role,
      },
    ],
  },
  {
    label: "Operações",
    items: [
      {
        title: "Projetos",
        href: "/projetos",
        icon: FolderKanban,
        requiredRole: "EMPLOYEE" as Role,
      },
      {
        title: "Compras",
        href: "/compras",
        icon: ShoppingCart,
        requiredRole: "EMPLOYEE" as Role,
      },
      {
        title: "Estoque",
        href: "/estoque",
        icon: Warehouse,
        requiredRole: "EMPLOYEE" as Role,
      },
    ],
  },
  {
    label: "Financeiro",
    items: [
      {
        title: "Fluxo de Caixa",
        href: "/financeiro",
        icon: Wallet,
        requiredRole: "MANAGER" as Role,
      },
    ],
  },
  {
    label: "Alertas",
    items: [
      {
        title: "Operação",
        href: "/operacao",
        icon: Bell,
        requiredRole: "EMPLOYEE" as Role,
      },
    ],
  },
]

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const userRole = (user.role as Role) ?? "VIEWER"

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-md p-1.5">
            <LayoutDashboard className="size-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">Gestão ERP</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {navigation.map((group) => {
          const visibleItems = group.items.filter((item) =>
            hasRole(userRole, item.requiredRole)
          )

          if (visibleItems.length === 0) return null

          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                      >
                        <Link href={item.href}>
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-2">
          <UserCircle className="size-8 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
