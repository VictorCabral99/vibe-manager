import type { Role } from "@prisma/client"

// ─────────────────────────────────────────────
// Hierarquia de permissões
// ADMIN > MANAGER > EMPLOYEE > VIEWER
// ─────────────────────────────────────────────

const ROLE_HIERARCHY: Record<Role, number> = {
  ADMIN: 4,
  MANAGER: 3,
  EMPLOYEE: 2,
  VIEWER: 1,
}

export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

// Permissões granulares por domínio
export const PERMISSIONS = {
  // Usuários
  users: {
    view: (role: Role) => hasRole(role, "MANAGER"),
    create: (role: Role) => hasRole(role, "ADMIN"),
    edit: (role: Role) => hasRole(role, "ADMIN"),
    delete: (role: Role) => hasRole(role, "ADMIN"),
  },
  // Funcionários
  employees: {
    view: (role: Role) => hasRole(role, "MANAGER"),
    create: (role: Role) => hasRole(role, "MANAGER"),
    edit: (role: Role) => hasRole(role, "MANAGER"),
    delete: (role: Role) => hasRole(role, "ADMIN"),
  },
  // Clientes
  clients: {
    view: (role: Role) => hasRole(role, "EMPLOYEE"),
    create: (role: Role) => hasRole(role, "EMPLOYEE"),
    edit: (role: Role) => hasRole(role, "EMPLOYEE"),
    delete: (role: Role) => hasRole(role, "MANAGER"),
  },
  // Catálogo
  catalog: {
    view: (role: Role) => hasRole(role, "VIEWER"),
    create: (role: Role) => hasRole(role, "MANAGER"),
    edit: (role: Role) => hasRole(role, "MANAGER"),
    delete: (role: Role) => hasRole(role, "ADMIN"),
  },
  // Orçamentos
  quotes: {
    view: (role: Role) => hasRole(role, "EMPLOYEE"),
    create: (role: Role) => hasRole(role, "EMPLOYEE"),
    edit: (role: Role) => hasRole(role, "EMPLOYEE"),
    delete: (role: Role) => hasRole(role, "MANAGER"),
    approve: (role: Role) => hasRole(role, "MANAGER"),
  },
  // Projetos
  projects: {
    view: (role: Role) => hasRole(role, "EMPLOYEE"),
    create: (role: Role) => hasRole(role, "MANAGER"),
    edit: (role: Role) => hasRole(role, "MANAGER"),
    close: (role: Role) => hasRole(role, "MANAGER"),
  },
  // Compras
  purchases: {
    view: (role: Role) => hasRole(role, "EMPLOYEE"),
    create: (role: Role) => hasRole(role, "EMPLOYEE"), // controlado por canPurchase no Employee
    delete: (role: Role) => hasRole(role, "MANAGER"),
  },
  // Estoque
  stock: {
    view: (role: Role) => hasRole(role, "EMPLOYEE"),
    withdraw: (role: Role) => hasRole(role, "EMPLOYEE"), // controlado por canWithdrawStock no Employee
    manage: (role: Role) => hasRole(role, "MANAGER"),
  },
  // Financeiro
  financial: {
    view: (role: Role) => hasRole(role, "MANAGER"),
    manage: (role: Role) => hasRole(role, "ADMIN"),
  },
  // Dashboard
  dashboard: {
    view: (role: Role) => hasRole(role, "MANAGER"),
  },
  // Operação (alertas, display)
  operacao: {
    view: (role: Role) => hasRole(role, "EMPLOYEE"),
    create: (role: Role) => hasRole(role, "EMPLOYEE"),
    manage: (role: Role) => hasRole(role, "MANAGER"),
  },
} as const
