"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MeasurementUnit } from "@prisma/client"
import { Plus, Trash2, Package, Wrench } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { formatCurrency } from "@/lib/format"
import { calculateQuoteTotals } from "@/domains/comercial/orcamentos/calculations"
import type { QuoteItemInput, QuoteServiceInput } from "@/domains/comercial/orcamentos/types"
import { createQuoteAction, updateQuoteAction } from "@/domains/comercial/orcamentos/actions"
import { QuickCreateClientDialog } from "@/components/quick-create/quick-create-client-dialog"
import { QuickCreateProductDialog } from "@/components/quick-create/quick-create-product-dialog"
import { QuickCreateServiceDialog } from "@/components/quick-create/quick-create-service-dialog"

// ─────────────────────────────────────────────
// Tipos das props
// ─────────────────────────────────────────────

interface ClientOption {
  id: string
  name: string
}

interface ProductOption {
  id: string
  name: string
  unit: MeasurementUnit
  category: string
}

interface ServiceOption {
  id: string
  name: string
  basePrice: number | null
  description: string | null
}

interface QuoteFormProps {
  clients: ClientOption[]
  products: ProductOption[]
  services: ServiceOption[]
  // Para edição
  defaultValues?: {
    id: string
    clientId: string
    applyFee: boolean
    notes?: string | null
    items: Array<{
      productId: string
      quantity: number
      unitPrice: number
    }>
    services: Array<{
      serviceId: string
      quantity: number
      unitPrice: number
      description?: string | null
    }>
  }
}

// ─────────────────────────────────────────────
// Componente de adição de item
// ─────────────────────────────────────────────

interface AddItemRowProps {
  products: ProductOption[]
  onAdd: (item: { productId: string; quantity: number; unitPrice: number }) => void
  onProductCreated: (product: ProductOption) => void
}

function AddItemRow({ products, onAdd, onProductCreated }: AddItemRowProps) {
  const [productId, setProductId] = useState("")
  const [quantity, setQuantity] = useState("")
  const [unitPrice, setUnitPrice] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  const selectedProduct = products.find((p) => p.id === productId)

  function handleAdd() {
    const qty = parseFloat(quantity)
    const price = parseFloat(unitPrice)
    if (!productId || isNaN(qty) || qty <= 0 || isNaN(price) || price < 0) {
      toast.error("Preencha todos os campos do item corretamente")
      return
    }
    onAdd({ productId, quantity: qty, unitPrice: price })
    setProductId("")
    setQuantity("")
    setUnitPrice("")
  }

  return (
    <>
      <div className="flex gap-2 items-end flex-wrap">
        <div className="flex-1 min-w-48">
          <Label className="text-xs text-muted-foreground mb-1 block">Produto</Label>
          <Select
            value={productId}
            onValueChange={(val) => {
              if (val === "__create__") {
                setDialogOpen(true)
              } else {
                setProductId(val)
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar produto..." />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
              <SelectSeparator />
              <SelectItem value="__create__" className="text-primary font-medium">
                <Plus className="size-3 mr-1 inline-block" />
                Novo produto
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-28">
          <Label className="text-xs text-muted-foreground mb-1 block">
            Qtd {selectedProduct ? `(${selectedProduct.unit})` : ""}
          </Label>
          <Input
            type="number"
            min="0.001"
            step="0.001"
            placeholder="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <div className="w-36">
          <Label className="text-xs text-muted-foreground mb-1 block">Preço Unit. (R$)</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0,00"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
          />
        </div>

        <Button type="button" variant="outline" onClick={handleAdd}>
          <Plus className="size-4 mr-1" />
          Adicionar
        </Button>
      </div>

      <QuickCreateProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(product) => {
          onProductCreated(product)
          setProductId(product.id)
        }}
      />
    </>
  )
}

// ─────────────────────────────────────────────
// Componente de adição de serviço
// ─────────────────────────────────────────────

interface AddServiceRowProps {
  services: ServiceOption[]
  onAdd: (svc: {
    serviceId: string
    quantity: number
    unitPrice: number
    description?: string
  }) => void
  onServiceCreated: (service: ServiceOption) => void
}

function AddServiceRow({ services, onAdd, onServiceCreated }: AddServiceRowProps) {
  const [serviceId, setServiceId] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [unitPrice, setUnitPrice] = useState("")
  const [description, setDescription] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  function handleServiceSelect(id: string) {
    setServiceId(id)
    const svc = services.find((s) => s.id === id)
    if (svc?.basePrice) {
      setUnitPrice(svc.basePrice.toFixed(2))
    }
  }

  function handleAdd() {
    const qty = parseFloat(quantity)
    const price = parseFloat(unitPrice)
    if (!serviceId || isNaN(qty) || qty <= 0 || isNaN(price) || price < 0) {
      toast.error("Preencha todos os campos do serviço corretamente")
      return
    }
    onAdd({
      serviceId,
      quantity: qty,
      unitPrice: price,
      description: description.trim() || undefined,
    })
    setServiceId("")
    setQuantity("1")
    setUnitPrice("")
    setDescription("")
  }

  return (
    <>
      <div className="flex gap-2 items-end flex-wrap">
        <div className="flex-1 min-w-48">
          <Label className="text-xs text-muted-foreground mb-1 block">Serviço</Label>
          <Select
            value={serviceId}
            onValueChange={(val) => {
              if (val === "__create__") {
                setDialogOpen(true)
              } else {
                handleServiceSelect(val)
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecionar serviço..." />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
              <SelectSeparator />
              <SelectItem value="__create__" className="text-primary font-medium">
                <Plus className="size-3 mr-1 inline-block" />
                Novo serviço
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-24">
          <Label className="text-xs text-muted-foreground mb-1 block">Qtd</Label>
          <Input
            type="number"
            min="0.001"
            step="0.001"
            placeholder="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <div className="w-36">
          <Label className="text-xs text-muted-foreground mb-1 block">Preço Unit. (R$)</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0,00"
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
          />
        </div>

        <div className="flex-1 min-w-40">
          <Label className="text-xs text-muted-foreground mb-1 block">Descrição (opcional)</Label>
          <Input
            placeholder="Descrição adicional..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <Button type="button" variant="outline" onClick={handleAdd}>
          <Plus className="size-4 mr-1" />
          Adicionar
        </Button>
      </div>

      <QuickCreateServiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={(service) => {
          onServiceCreated(service)
          setServiceId(service.id)
          if (service.basePrice) {
            setUnitPrice(service.basePrice.toFixed(2))
          }
        }}
      />
    </>
  )
}

// ─────────────────────────────────────────────
// Formulário principal
// ─────────────────────────────────────────────

type FormMode = "create" | "edit"

export function QuoteForm({ clients, products, services, defaultValues }: QuoteFormProps) {
  const router = useRouter()
  const mode: FormMode = defaultValues ? "edit" : "create"

  // Listas locais mutáveis (para adicionar itens criados inline)
  const [clientList, setClientList] = useState<ClientOption[]>(clients)
  const [productList, setProductList] = useState<ProductOption[]>(products)
  const [serviceList, setServiceList] = useState<ServiceOption[]>(services)

  // Lista de itens e serviços (gerenciados manualmente para melhor UX)
  const [itemRows, setItemRows] = useState<
    Array<{ productId: string; quantity: number; unitPrice: number }>
  >(defaultValues?.items ?? [])

  const [serviceRows, setServiceRows] = useState<
    Array<{
      serviceId: string
      quantity: number
      unitPrice: number
      description?: string
    }>
  >((defaultValues?.services ?? []).map((s) => ({ ...s, description: s.description ?? undefined })))

  const [applyFee, setApplyFee] = useState(defaultValues?.applyFee ?? false)
  const [clientId, setClientId] = useState(defaultValues?.clientId ?? "")
  const [notes, setNotes] = useState(defaultValues?.notes ?? "")
  const [submitting, setSubmitting] = useState(false)
  const [clientDialogOpen, setClientDialogOpen] = useState(false)

  // Calcula totais em tempo real usando a função do domain
  const itemInputs: QuoteItemInput[] = itemRows.map((r) => ({
    productId: r.productId,
    productName: productList.find((p) => p.id === r.productId)?.name ?? "",
    quantity: r.quantity,
    unitPrice: r.unitPrice,
  }))

  const serviceInputs: QuoteServiceInput[] = serviceRows.map((r) => ({
    serviceId: r.serviceId,
    serviceName: serviceList.find((s) => s.id === r.serviceId)?.name ?? "",
    quantity: r.quantity,
    unitPrice: r.unitPrice,
    description: r.description,
  }))

  const totals = calculateQuoteTotals(itemInputs, serviceInputs, applyFee)

  function addItem(item: { productId: string; quantity: number; unitPrice: number }) {
    setItemRows((prev) => [...prev, item])
  }

  function removeItem(index: number) {
    setItemRows((prev) => prev.filter((_, i) => i !== index))
  }

  function addService(svc: {
    serviceId: string
    quantity: number
    unitPrice: number
    description?: string
  }) {
    setServiceRows((prev) => [...prev, svc])
  }

  function removeService(index: number) {
    setServiceRows((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!clientId) {
      toast.error("Selecione um cliente")
      return
    }

    if (itemRows.length === 0 && serviceRows.length === 0) {
      toast.error("Adicione ao menos 1 item ou serviço")
      return
    }

    setSubmitting(true)

    try {
      if (mode === "create") {
        const result = await createQuoteAction({
          clientId,
          applyFee,
          notes: notes.trim() || undefined,
          items: itemRows,
          services: serviceRows,
        })

        if (result.success && result.data) {
          toast.success("Orçamento criado com sucesso!")
          router.push(`/comercial/orcamentos/${result.data.id}`)
        } else {
          toast.error(result.error ?? "Erro ao criar orçamento")
        }
      } else if (defaultValues) {
        const result = await updateQuoteAction({
          id: defaultValues.id,
          clientId,
          applyFee,
          notes: notes.trim() || undefined,
          items: itemRows,
          services: serviceRows,
        })

        if (result.success && result.data) {
          toast.success("Orçamento atualizado com sucesso!")
          router.push(`/comercial/orcamentos/${result.data.id}`)
        } else {
          toast.error(result.error ?? "Erro ao atualizar orçamento")
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dados básicos */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Orçamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Cliente *</Label>
              <Select
                value={clientId}
                onValueChange={(val) => {
                  if (val === "__create__") {
                    setClientDialogOpen(true)
                  } else {
                    setClientId(val)
                  }
                }}
              >
                <SelectTrigger id="clientId">
                  <SelectValue placeholder="Selecionar cliente..." />
                </SelectTrigger>
                <SelectContent>
                  {clientList.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                  <SelectSeparator />
                  <SelectItem value="__create__" className="text-primary font-medium">
                    <Plus className="size-3 mr-1 inline-block" />
                    Novo cliente
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 pt-8">
              <Switch
                id="applyFee"
                checked={applyFee}
                onCheckedChange={setApplyFee}
              />
              <Label htmlFor="applyFee" className="cursor-pointer">
                Aplicar taxa de 15%
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Observações adicionais sobre o orçamento..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Itens de Produto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="size-5" />
            Itens (Produtos)
          </CardTitle>
          <CardDescription>
            Adicione os produtos que fazem parte deste orçamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AddItemRow
            products={productList}
            onAdd={addItem}
            onProductCreated={(p) => setProductList((prev) => [...prev, p])}
          />

          {itemRows.length > 0 && (
            <>
              <Separator />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Preço Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemRows.map((row, index) => {
                    const product = productList.find((p) => p.id === row.productId)
                    const lineTotal = row.quantity * row.unitPrice
                    return (
                      <TableRow key={index}>
                        <TableCell>{product?.name ?? row.productId}</TableCell>
                        <TableCell className="text-right">
                          {row.quantity} {product?.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(row.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(lineTotal)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      {/* Itens de Serviço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="size-5" />
            Serviços
          </CardTitle>
          <CardDescription>
            Adicione os serviços que fazem parte deste orçamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AddServiceRow
            services={serviceList}
            onAdd={addService}
            onServiceCreated={(s) => setServiceList((prev) => [...prev, s])}
          />

          {serviceRows.length > 0 && (
            <>
              <Separator />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Preço Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serviceRows.map((row, index) => {
                    const service = serviceList.find((s) => s.id === row.serviceId)
                    const lineTotal = row.quantity * row.unitPrice
                    return (
                      <TableRow key={index}>
                        <TableCell>{service?.name ?? row.serviceId}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {row.description ?? "—"}
                        </TableCell>
                        <TableCell className="text-right">{row.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(row.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(lineTotal)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeService(index)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      {/* Resumo de totais */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-sm ml-auto">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal Produtos</span>
              <span>{formatCurrency(totals.subtotalItems)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal Serviços</span>
              <span>{formatCurrency(totals.subtotalServices)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            {applyFee && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxa (15%)</span>
                <span className="text-orange-600">{formatCurrency(totals.fee)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span className="text-green-600">{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={submitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Salvando..."
            : mode === "create"
              ? "Criar Orçamento"
              : "Salvar Alterações"}
        </Button>
      </div>

      {/* Dialogs de criação rápida */}
      <QuickCreateClientDialog
        open={clientDialogOpen}
        onOpenChange={setClientDialogOpen}
        onCreated={(c) => {
          setClientList((prev) => [...prev, c])
          setClientId(c.id)
        }}
      />
    </form>
  )
}
