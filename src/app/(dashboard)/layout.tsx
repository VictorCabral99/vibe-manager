export const dynamic = "force-dynamic"

import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AppSidebar } from "@/components/shared/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppHeader } from "@/components/shared/app-header"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <SidebarProvider>
      <AppSidebar user={session.user} />
      <div className="flex flex-col flex-1 min-h-screen">
        <AppHeader user={session.user} />
        <main className="flex-1 p-6 bg-background">{children}</main>
      </div>
    </SidebarProvider>
  )
}
