import { describe, it, expect } from "vitest"
import { hasRole, PERMISSIONS } from "./permissions"
import type { Role } from "@prisma/client"

// ─────────────────────────────────────────────
// hasRole
// ─────────────────────────────────────────────

describe("hasRole", () => {
  describe("ADMIN", () => {
    it("satisfaz qualquer role requerida", () => {
      expect(hasRole("ADMIN", "ADMIN")).toBe(true)
      expect(hasRole("ADMIN", "MANAGER")).toBe(true)
      expect(hasRole("ADMIN", "EMPLOYEE")).toBe(true)
      expect(hasRole("ADMIN", "VIEWER")).toBe(true)
    })
  })

  describe("MANAGER", () => {
    it("satisfaz MANAGER, EMPLOYEE e VIEWER", () => {
      expect(hasRole("MANAGER", "MANAGER")).toBe(true)
      expect(hasRole("MANAGER", "EMPLOYEE")).toBe(true)
      expect(hasRole("MANAGER", "VIEWER")).toBe(true)
    })

    it("não satisfaz ADMIN", () => {
      expect(hasRole("MANAGER", "ADMIN")).toBe(false)
    })
  })

  describe("EMPLOYEE", () => {
    it("satisfaz EMPLOYEE e VIEWER", () => {
      expect(hasRole("EMPLOYEE", "EMPLOYEE")).toBe(true)
      expect(hasRole("EMPLOYEE", "VIEWER")).toBe(true)
    })

    it("não satisfaz MANAGER nem ADMIN", () => {
      expect(hasRole("EMPLOYEE", "MANAGER")).toBe(false)
      expect(hasRole("EMPLOYEE", "ADMIN")).toBe(false)
    })
  })

  describe("VIEWER", () => {
    it("satisfaz apenas VIEWER", () => {
      expect(hasRole("VIEWER", "VIEWER")).toBe(true)
    })

    it("não satisfaz EMPLOYEE, MANAGER nem ADMIN", () => {
      expect(hasRole("VIEWER", "EMPLOYEE")).toBe(false)
      expect(hasRole("VIEWER", "MANAGER")).toBe(false)
      expect(hasRole("VIEWER", "ADMIN")).toBe(false)
    })
  })

  it("hierarquia é estritamente ADMIN > MANAGER > EMPLOYEE > VIEWER", () => {
    const roles: Role[] = ["VIEWER", "EMPLOYEE", "MANAGER", "ADMIN"]
    for (let i = 0; i < roles.length; i++) {
      for (let j = 0; j < roles.length; j++) {
        expect(hasRole(roles[i], roles[j])).toBe(i >= j)
      }
    }
  })
})

// ─────────────────────────────────────────────
// PERMISSIONS — spot checks por domínio
// ─────────────────────────────────────────────

describe("PERMISSIONS.users", () => {
  it("view: apenas MANAGER ou superior", () => {
    expect(PERMISSIONS.users.view("ADMIN")).toBe(true)
    expect(PERMISSIONS.users.view("MANAGER")).toBe(true)
    expect(PERMISSIONS.users.view("EMPLOYEE")).toBe(false)
    expect(PERMISSIONS.users.view("VIEWER")).toBe(false)
  })

  it("create/edit/delete: apenas ADMIN", () => {
    for (const action of ["create", "edit", "delete"] as const) {
      expect(PERMISSIONS.users[action]("ADMIN")).toBe(true)
      expect(PERMISSIONS.users[action]("MANAGER")).toBe(false)
      expect(PERMISSIONS.users[action]("EMPLOYEE")).toBe(false)
      expect(PERMISSIONS.users[action]("VIEWER")).toBe(false)
    }
  })
})

describe("PERMISSIONS.clients", () => {
  it("view/create/edit: EMPLOYEE ou superior", () => {
    for (const action of ["view", "create", "edit"] as const) {
      expect(PERMISSIONS.clients[action]("ADMIN")).toBe(true)
      expect(PERMISSIONS.clients[action]("MANAGER")).toBe(true)
      expect(PERMISSIONS.clients[action]("EMPLOYEE")).toBe(true)
      expect(PERMISSIONS.clients[action]("VIEWER")).toBe(false)
    }
  })

  it("delete: apenas MANAGER ou superior", () => {
    expect(PERMISSIONS.clients.delete("ADMIN")).toBe(true)
    expect(PERMISSIONS.clients.delete("MANAGER")).toBe(true)
    expect(PERMISSIONS.clients.delete("EMPLOYEE")).toBe(false)
    expect(PERMISSIONS.clients.delete("VIEWER")).toBe(false)
  })
})

describe("PERMISSIONS.catalog", () => {
  it("view: qualquer role incluindo VIEWER", () => {
    expect(PERMISSIONS.catalog.view("VIEWER")).toBe(true)
    expect(PERMISSIONS.catalog.view("EMPLOYEE")).toBe(true)
  })

  it("create/edit: MANAGER ou superior", () => {
    expect(PERMISSIONS.catalog.create("MANAGER")).toBe(true)
    expect(PERMISSIONS.catalog.create("EMPLOYEE")).toBe(false)
    expect(PERMISSIONS.catalog.edit("MANAGER")).toBe(true)
    expect(PERMISSIONS.catalog.edit("EMPLOYEE")).toBe(false)
  })

  it("delete: apenas ADMIN", () => {
    expect(PERMISSIONS.catalog.delete("ADMIN")).toBe(true)
    expect(PERMISSIONS.catalog.delete("MANAGER")).toBe(false)
  })
})

describe("PERMISSIONS.quotes", () => {
  it("view/create/edit: EMPLOYEE ou superior", () => {
    expect(PERMISSIONS.quotes.view("EMPLOYEE")).toBe(true)
    expect(PERMISSIONS.quotes.create("EMPLOYEE")).toBe(true)
    expect(PERMISSIONS.quotes.edit("EMPLOYEE")).toBe(true)
    expect(PERMISSIONS.quotes.view("VIEWER")).toBe(false)
  })

  it("approve/delete: MANAGER ou superior", () => {
    expect(PERMISSIONS.quotes.approve("MANAGER")).toBe(true)
    expect(PERMISSIONS.quotes.approve("EMPLOYEE")).toBe(false)
    expect(PERMISSIONS.quotes.delete("MANAGER")).toBe(true)
    expect(PERMISSIONS.quotes.delete("EMPLOYEE")).toBe(false)
  })
})

describe("PERMISSIONS.financial", () => {
  it("view: MANAGER ou superior", () => {
    expect(PERMISSIONS.financial.view("MANAGER")).toBe(true)
    expect(PERMISSIONS.financial.view("EMPLOYEE")).toBe(false)
    expect(PERMISSIONS.financial.view("VIEWER")).toBe(false)
  })

  it("manage: apenas ADMIN", () => {
    expect(PERMISSIONS.financial.manage("ADMIN")).toBe(true)
    expect(PERMISSIONS.financial.manage("MANAGER")).toBe(false)
  })
})

describe("PERMISSIONS.stock", () => {
  it("view/withdraw: EMPLOYEE ou superior", () => {
    expect(PERMISSIONS.stock.view("EMPLOYEE")).toBe(true)
    expect(PERMISSIONS.stock.withdraw("EMPLOYEE")).toBe(true)
    expect(PERMISSIONS.stock.view("VIEWER")).toBe(false)
  })

  it("manage: MANAGER ou superior", () => {
    expect(PERMISSIONS.stock.manage("MANAGER")).toBe(true)
    expect(PERMISSIONS.stock.manage("EMPLOYEE")).toBe(false)
  })
})

describe("PERMISSIONS.dashboard", () => {
  it("view: MANAGER ou superior", () => {
    expect(PERMISSIONS.dashboard.view("ADMIN")).toBe(true)
    expect(PERMISSIONS.dashboard.view("MANAGER")).toBe(true)
    expect(PERMISSIONS.dashboard.view("EMPLOYEE")).toBe(false)
    expect(PERMISSIONS.dashboard.view("VIEWER")).toBe(false)
  })
})
