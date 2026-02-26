"use client"

import { useState } from "react"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { createPurchaseSchema, type CreatePurchaseInput } from "@/domains/compras/schemas"
import type { Resolver } from "react-hook-form"
import { createPurchaseAction } from "@/domains/compras/actions"
import type { BuyerItem } from "@/domains/compras/queries"
import type { ProjectListItem } from "@/domains/projetos/queries"
import { formatCurrency } from "@/lib/format"
import { Plus, Trash2 } from "lucide-react"
import { QuickCreateProductDialog } from "@/components/quick-create/quick-create-product-dialog"
import { ComboboxWithCreate } from "@/components/ui/combobox-with-create"

interface Product {
  id: string
  name: string
  unit: string
  category: string
}

interface PurchaseFormProps {
  buyers: BuyerItem[]
  products: Product[]
  projects: Pick<ProjectListItem, "id" | "name">[]
  defaultProjectId?: string
}

export function PurchaseForm({
  buyers,
  products: initialProducts,
  projects,
  defaultProjectId,
}: PurchaseFormProps) {
  const router = useRouter()
  const [productList, setProductList] = useState<Product[]>(initialProducts)
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [pendingProductIndex, setPendingProductIndex] = useState<number | null>(null)

  const form = useForm<CreatePurchaseInput>({
    resolver: zodResolver(createPurchaseSchema) as Resolver<CreatePurchaseInput>,
    defaultValues: {
      buyerId: "",
      supplier: "",
      date: new Date(),
      projectId: defaultProjectId ?? "",
      notes: "",
      items: [{ productId: "", quantity: 1, unitPrice: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const watchedItems = useWatch({ control: form.control, name: "items" })
  const total = watchedItems.reduce((acc, item) => acc + (item.quantity || 0) * (item.unitPrice || 0), 0)

  const isLoading = form.formState.isSubmitting

  async function onSubmit(data: CreatePurchaseInput) {
    const result = await createPurchaseAction(data)

    if (!result.success) {
      toast.error(result.error ?? "Erro ao registrar compra")
      return
    }

    toast.success("Compra registrada com sucesso!")
    router.push("/compras")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Cabeçalho */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="buyerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comprador *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o comprador" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {buyers.map((buyer) => (
                      <SelectItem key={buyer.id} value={buyer.id}>
                        {buyer.user.name} — {buyer.jobTitle}
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
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data da Compra *</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={
                      field.value instanceof Date
                        ? field.value.toISOString().slice(0, 10)
                        : ""
                    }
                    onChange={(e) => {
                      const [y, m, d] = e.target.value.split("-").map(Number)
                      field.onChange(new Date(y, m - 1, d))
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="supplier"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fornecedor</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do fornecedor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Projeto (opcional)</FormLabel>
                <Select onValueChange={(val) => field.onChange(val === "none" ? "" : val)} value={field.value || "none"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Vincular a um projeto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Nenhum projeto</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Itens */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Itens da Compra</h3>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                append({ productId: "", quantity: 1, unitPrice: 0 })
              }}
            >
              <Plus className="size-4 mr-2" />
              Adicionar Item
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid grid-cols-12 gap-2 items-end p-3 border rounded-md bg-muted/30"
              >
                <div className="col-span-5">
                  <FormField
                    control={form.control}
                    name={`items.${index}.productId`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Produto *</FormLabel>
                        <FormControl>
                          <ComboboxWithCreate
                            options={productList.map((p) => ({
                              value: p.id,
                              label: `${p.name} (${p.unit})`,
                            }))}
                            value={f.value}
                            onChange={f.onChange}
                            placeholder="Selecionar produto..."
                            searchPlaceholder="Buscar produto..."
                            createLabel="Novo produto"
                            onCreateClick={() => {
                              setPendingProductIndex(index)
                              setProductDialogOpen(true)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Quantidade *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.001"
                            min="0"
                            placeholder="0"
                            {...f}
                            onChange={(e) => f.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-3">
                  <FormField
                    control={form.control}
                    name={`items.${index}.unitPrice`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Preço Unit. (R$) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0,00"
                            {...f}
                            onChange={(e) => f.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-1 text-right text-sm font-medium pb-2">
                  {formatCurrency(
                    (watchedItems[index]?.quantity || 0) *
                      (watchedItems[index]?.unitPrice || 0)
                  )}
                </div>

                <div className="col-span-1 pb-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex justify-end">
            <div className="text-sm font-semibold">
              Total: {formatCurrency(total)}
            </div>
          </div>
        </div>

        <Separator />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea placeholder="Observações sobre a compra..." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/compras")}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Registrando..." : "Registrar Compra"}
          </Button>
        </div>
      </form>

      <QuickCreateProductDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        onCreated={(product) => {
          setProductList((prev) => [
            ...prev,
            { id: product.id, name: product.name, unit: product.unit as string, category: product.category },
          ])
          if (pendingProductIndex !== null) {
            form.setValue(`items.${pendingProductIndex}.productId`, product.id)
            setPendingProductIndex(null)
          }
        }}
      />
    </Form>
  )
}
