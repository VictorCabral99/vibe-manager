"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import type { Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { AlertPriority } from "@prisma/client"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createAlertSchema,
  type CreateAlertInput,
} from "@/domains/operacao/schemas"
import { createAlertAction } from "@/domains/operacao/actions"

// ─────────────────────────────────────────────
// Tipos de dados de seleção
// ─────────────────────────────────────────────

interface SelectOption {
  id: string
  name: string
}

interface AlertFormProps {
  projects: SelectOption[]
  products: SelectOption[]
  employees: SelectOption[]
}

// ─────────────────────────────────────────────
// Labels de prioridade
// ─────────────────────────────────────────────

const priorityOptions: { value: AlertPriority; label: string }[] = [
  { value: AlertPriority.LOW, label: "Baixo" },
  { value: AlertPriority.MEDIUM, label: "Médio" },
  { value: AlertPriority.HIGH, label: "Alto" },
  { value: AlertPriority.CRITICAL, label: "Crítico" },
]

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function AlertForm({ projects, products, employees }: AlertFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<CreateAlertInput>({
    resolver: zodResolver(createAlertSchema) as Resolver<CreateAlertInput>,
    defaultValues: {
      title: "",
      description: "",
      priority: AlertPriority.MEDIUM,
      projectId: undefined,
      productId: undefined,
      assignedToId: undefined,
    },
  })

  function onSubmit(data: CreateAlertInput) {
    startTransition(async () => {
      const result = await createAlertAction(data)
      if (result.success) {
        toast.success("Alerta criado com sucesso")
        router.push("/operacao")
      } else {
        toast.error(result.error ?? "Erro ao criar alerta")
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Estoque crítico de parafusos"
                  {...field}
                />
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
              <FormLabel>Descrição (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o problema ou situação..."
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
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prioridade</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {priorityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Projeto (opcional)</FormLabel>
                <Select
                  onValueChange={(v) =>
                    field.onChange(v === "__none" ? undefined : v)
                  }
                  defaultValue={field.value ?? "__none"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o projeto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none">Nenhum</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="productId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Produto (opcional)</FormLabel>
                <Select
                  onValueChange={(v) =>
                    field.onChange(v === "__none" ? undefined : v)
                  }
                  defaultValue={field.value ?? "__none"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o produto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none">Nenhum</SelectItem>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="assignedToId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável (opcional)</FormLabel>
              <Select
                onValueChange={(v) =>
                  field.onChange(v === "__none" ? undefined : v)
                }
                defaultValue={field.value ?? "__none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="__none">Nenhum</SelectItem>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/operacao")}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Criando..." : "Criar alerta"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
