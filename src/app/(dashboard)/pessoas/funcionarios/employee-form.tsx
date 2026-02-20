"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
} from "@/domains/pessoas/funcionarios/schemas"
import {
  createEmployeeAction,
  updateEmployeeAction,
} from "@/domains/pessoas/funcionarios/actions"
import type { EmployeeListItem, UserWithoutEmployee } from "@/domains/pessoas/funcionarios/queries"

interface EmployeeFormProps {
  employee?: EmployeeListItem
  availableUsers?: UserWithoutEmployee[]
  onSuccess?: () => void
}

export function EmployeeForm({ employee, availableUsers = [], onSuccess }: EmployeeFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEditing = !!employee

  const createForm = useForm<CreateEmployeeInput>({
    resolver: zodResolver(createEmployeeSchema) as Resolver<CreateEmployeeInput>,
    defaultValues: {
      userId: "",
      name: "",
      cpf: "",
      phone: "",
      jobTitle: "",
      canPurchase: false,
      canWithdrawStock: false,
      notes: "",
    },
  })

  const updateForm = useForm<CreateEmployeeInput>({
    resolver: zodResolver(updateEmployeeSchema) as unknown as Resolver<CreateEmployeeInput>,
    defaultValues: {
      name: employee?.name ?? "",
      cpf: employee?.cpf ?? "",
      phone: employee?.phone ?? "",
      jobTitle: employee?.jobTitle ?? "",
      canPurchase: employee?.canPurchase ?? false,
      canWithdrawStock: employee?.canWithdrawStock ?? false,
      notes: employee?.notes ?? "",
    },
  })

  const form = isEditing ? updateForm : createForm

  function onSubmit(data: CreateEmployeeInput) {
    startTransition(async () => {
      if (isEditing) {
        const result = await updateEmployeeAction({
          ...data,
          id: employee!.id,
        } as UpdateEmployeeInput)
        if (result.success) {
          toast.success("Funcionário atualizado com sucesso")
          if (onSuccess) {
            onSuccess()
          } else {
            router.push("/pessoas/funcionarios")
          }
        } else {
          toast.error(result.error ?? "Erro ao atualizar funcionário")
        }
      } else {
        const result = await createEmployeeAction(data)
        if (result.success) {
          toast.success("Funcionário criado com sucesso")
          router.push("/pessoas/funcionarios")
        } else {
          toast.error(result.error ?? "Erro ao criar funcionário")
        }
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!isEditing && (
          <FormField
            control={createForm.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Usuário vinculado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o usuário" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableUsers.length === 0 ? (
                      <SelectItem value="_empty" disabled>
                        Nenhum usuário disponível
                      </SelectItem>
                    ) : (
                      availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} — {user.email}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Somente números (11 dígitos)"
                    maxLength={11}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input
                    placeholder="(11) 99999-9999"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="jobTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cargo</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Técnico, Analista, Supervisor" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="canPurchase"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <FormLabel className="cursor-pointer">Pode realizar compras</FormLabel>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="canWithdrawStock"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <FormLabel className="cursor-pointer">Pode retirar do estoque</FormLabel>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Informações adicionais sobre o funcionário..."
                  className="resize-none"
                  rows={3}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (onSuccess) {
                onSuccess()
              } else {
                router.push("/pessoas/funcionarios")
              }
            }}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Salvando..."
              : isEditing
              ? "Salvar alterações"
              : "Criar funcionário"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
