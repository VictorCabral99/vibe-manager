import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Rotas que não precisam de autenticação
const PUBLIC_ROUTES = ["/login", "/recuperar-senha"]

// Rotas da API que não precisam de autenticação
const PUBLIC_API_ROUTES = ["/api/auth"]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
  const isPublicApi = PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))

  // Rota pública de API — deixa passar
  if (isPublicApi) return NextResponse.next()

  // Usuário não autenticado tentando acessar rota protegida
  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Usuário autenticado tentando acessar rota pública (ex: /login)
  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
