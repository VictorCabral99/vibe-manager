import { LoginForm } from "./login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Sistema de Gestão</h1>
          <p className="text-muted-foreground mt-1">Acesse sua conta para continuar</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
