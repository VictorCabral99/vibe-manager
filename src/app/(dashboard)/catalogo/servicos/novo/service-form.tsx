"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { createServiceAction } from "@/domains/catalogo/servicos/actions"
import {
  createServiceSchema,
  type CreateServiceInput,
} from "@/domains/catalogo/servicos/schemas"

export function ServiceForm() {
  const router = useRouter()

  const form = useForm<CreateServiceInput>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: undefined,
      isActive: true,
    },
  })

  async function onSubmit(data: CreateServiceInput) {
    const result = await createServiceAction(data)
    if (result.success && result.data) {
      toast.success("Serviço criado com sucesso")
      router.push("/catalogo/servicos")
    } else {
      toast.error(result.error ?? "Erro ao criar serviço")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do serviço" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição detalhada do serviço..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor Base (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="0,00"
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value
                        field.onChange(val === "" ? undefined : parseFloat(val))
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Valor sugerido por padrão ao adicionar este serviço a um orçamento
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Serviço Ativo</FormLabel>
                    <FormDescription>
                      Serviços inativos não aparecem em novas seleções
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
