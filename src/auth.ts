import NextAuth from "next-auth"
import { authConfig } from "@/domains/auth/config"

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
