"use client"

import { useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createProjectSchema, type CreateProjectInput } from "@/domains/projetos/schemas"
import { createProjectAction } from "@/domains/projetos/actions"
import type { ClientListItem } from "@/domains/pessoas/clientes/queries"
import { QuickCreateClientDialog } from "@/components/quick-create/quick-create-client-dialog"

interface ProjectFormProps {
  clients: ClientListItem[]
}

export function ProjectForm({ clients: initialClients }: ProjectFormProps) {
  const router = useRouter()
  const [clientList, setClientList] = useState(initialClients)
  const [clientDialogOpen, setClientDialogOpen] = useState(false)

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema) as Resolver<CreateProjectInput>,
    defaultValues: {
      name: "",
      clientId: "",
      totalRevenue: 0,
      targetMargin: 0.6,
      notes: "",
    },
  })

  const isLoading = form.formState.isSubmitting

  async function onSubmit(data: CreateProjectInput) {
    const result = await createProjectAction(data)

    if (!result.success) {
      toast.error(result.error ?? "Erro ao criar projeto")
      return
    }

    toast.success("Projeto criado com sucesso!")
    router.push(`/projetos/${result.data?.id}`)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Projeto *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Obra residencial Av. Principal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente *</FormLabel>
                <Select
                  onValueChange={(val) => {
                    if (val === "__create__") {
                      setClientDialogOpen(true)
                    } else {
                      field.onChange(val)
                    }
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clientList.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                    <SelectSeparator />
                    <SelectItem value="__create__" className="text-primary font-medium">
                      <Plus className="size-3 mr-1 inline-block" />
                      Novo cliente
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalRevenue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Receita Total (R$) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetMargin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Margem Alvo (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="60"
                    value={field.value * 100}
                    onChange={(e) => field.onChange((parseFloat(e.target.value) || 0) / 100)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações sobre o projeto..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/projetos")}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Criando..." : "Criar Projeto"}
          </Button>
        </div>
      </form>

      <QuickCreateClientDialog
        open={clientDialogOpen}
        onOpenChange={setClientDialogOpen}
        onCreated={(c) => {
          setClientList((prev) => [...prev, c as ClientListItem])
          form.setValue("clientId", c.id)
        }}
      />
    </Form>
  )
}
