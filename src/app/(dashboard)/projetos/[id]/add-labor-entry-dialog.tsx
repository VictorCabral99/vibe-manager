"use client"

import { useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { createLaborEntrySchema, type CreateLaborEntryInput } from "@/domains/projetos/schemas"
import { createLaborEntryAction } from "@/domains/projetos/actions"
import type { LaborProfessionalItem } from "@/domains/projetos/queries"
import { Plus } from "lucide-react"
import { formatCurrency } from "@/lib/format"

interface AddLaborEntryDialogProps {
  projectId: string
  professionals: LaborProfessionalItem[]
}

export function AddLaborEntryDialog({ projectId, professionals }: AddLaborEntryDialogProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<CreateLaborEntryInput>({
    resolver: zodResolver(createLaborEntrySchema) as Resolver<CreateLaborEntryInput>,
    defaultValues: {
      projectId,
      professionalId: "",
      date: new Date(),
      quantity: 1,
      description: "",
    },
  })

  const isLoading = form.formState.isSubmitting
  const selectedProfessionalId = form.watch("professionalId")
  const selectedQuantity = form.watch("quantity")

  const selectedProfessional = professionals.find((p) => p.id === selectedProfessionalId)
  const estimatedTotal =
    selectedProfessional && selectedQuantity
      ? Number(selectedProfessional.dailyRate) * selectedQuantity
      : null

  async function onSubmit(data: CreateLaborEntryInput) {
    const result = await createLaborEntryAction(data)

    if (!result.success) {
      toast.error(result.error ?? "Erro ao registrar lançamento")
      return
    }

    toast.success("Lançamento registrado com sucesso!")
    form.reset({ projectId, professionalId: "", date: new Date(), quantity: 1, description: "" })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4 mr-2" />
          Registrar Diária
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Mão de Obra</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="professionalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profissional *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o profissional" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {professionals.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} — {formatCurrency(Number(p.dailyRate))}/dia
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade (diárias) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        min="0.5"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={
                          field.value instanceof Date
                            ? field.value.toISOString().slice(0, 10)
                            : ""
                        }
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Descrição opcional..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {estimatedTotal !== null && (
              <div className="rounded-md bg-muted p-3 text-sm">
                <span className="text-muted-foreground">Total estimado: </span>
                <span className="font-semibold">{formatCurrency(estimatedTotal)}</span>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Registrando..." : "Registrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
