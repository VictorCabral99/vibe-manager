"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Role } from "@prisma/client"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createUserSchema, updateUserSchema, type CreateUserInput, type UpdateUserInput } from "@/domains/pessoas/usuarios/schemas"
import { createUserAction, updateUserAction } from "@/domains/pessoas/usuarios/actions"
import type { UserListItem } from "@/domains/pessoas/usuarios/queries"

interface UserFormProps {
  user?: UserListItem
  onSuccess?: () => void
}

const roleOptions: { value: Role; label: string }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Gerente" },
  { value: "EMPLOYEE", label: "Funcionário" },
  { value: "VIEWER", label: "Visualizador" },
]

export function UserForm({ user, onSuccess }: UserFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEditing = !!user

  const createForm = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema) as Resolver<CreateUserInput>,
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "EMPLOYEE",
      isActive: true,
    },
  })

  const updateForm = useForm<CreateUserInput>({
    resolver: zodResolver(updateUserSchema) as unknown as Resolver<CreateUserInput>,
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      password: "",
      role: user?.role ?? "EMPLOYEE",
      isActive: user?.isActive ?? true,
    },
  })

  const form = isEditing ? updateForm : createForm

  function onSubmit(data: CreateUserInput) {
    startTransition(async () => {
      if (isEditing) {
        const result = await updateUserAction({
          ...data,
          id: user!.id,
        } as UpdateUserInput)
        if (result.success) {
          toast.success("Usuário atualizado com sucesso")
          if (onSuccess) {
            onSuccess()
          } else {
            router.push("/pessoas/usuarios")
          }
        } else {
          toast.error(result.error ?? "Erro ao atualizar usuário")
        }
      } else {
        const result = await createUserAction(data)
        if (result.success) {
          toast.success("Usuário criado com sucesso")
          router.push("/pessoas/usuarios")
        } else {
          toast.error(result.error ?? "Erro ao criar usuário")
        }
      }
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
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

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input type="email" placeholder="usuario@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isEditing && (
          <FormField
            control={createForm.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Mínimo 6 caracteres" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Perfil</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <FormLabel className="cursor-pointer">Usuário ativo</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
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
                router.push("/pessoas/usuarios")
              }
            }}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar usuário"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
