import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function RecuperarSenhaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Recuperar Senha</h1>
          <p className="text-muted-foreground mt-1">
            Informe seu e-mail para receber as instruções
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Redefinir senha</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" />
            </div>
            <Button className="w-full">Enviar instruções</Button>
            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              >
                Voltar ao login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
