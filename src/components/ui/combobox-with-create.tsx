"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxWithCreateProps {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  createLabel: string
  onCreateClick: () => void
  /** Número de itens exibidos antes de mostrar "Ver mais" (default: 10) */
  pageSize?: number
  className?: string
  disabled?: boolean
}

export function ComboboxWithCreate({
  options,
  value,
  onChange,
  placeholder = "Selecionar...",
  searchPlaceholder = "Buscar...",
  createLabel,
  onCreateClick,
  pageSize = 10,
  className,
  disabled,
}: ComboboxWithCreateProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [showAll, setShowAll] = useState(false)

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  const isSearching = search.length > 0
  const visible = isSearching || showAll ? filtered : filtered.slice(0, pageSize)
  const remaining = filtered.length - pageSize

  const selected = options.find((o) => o.value === value)

  function handleClose(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setSearch("")
      setShowAll(false)
    }
  }

  function handleSelect(val: string) {
    onChange(val)
    handleClose(false)
  }

  function handleCreate() {
    handleClose(false)
    onCreateClick()
  }

  return (
    <Popover open={open} onOpenChange={handleClose}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", className)}
        >
          {selected ? (
            selected.label
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        style={{ width: "var(--radix-popover-trigger-width)" }}
        align="start"
      >
        <Command shouldFilter={false}>
          {/* Criar novo — sempre primeiro */}
          <div className="p-1 pb-0">
            <button
              type="button"
              onClick={handleCreate}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm font-medium text-primary hover:bg-accent hover:text-accent-foreground"
            >
              <Plus className="size-4 shrink-0" />
              {createLabel}
            </button>
          </div>

          <CommandSeparator className="mt-1" />

          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />

          <CommandList>
            {filtered.length === 0 ? (
              <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            ) : (
              <CommandGroup>
                {visible.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "size-4 shrink-0",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}

                {!isSearching && !showAll && remaining > 0 && (
                  <CommandItem
                    value="__show_more__"
                    onSelect={() => setShowAll(true)}
                    className="text-muted-foreground justify-center text-xs italic"
                  >
                    Ver mais {remaining} resultado{remaining !== 1 ? "s" : ""}…
                  </CommandItem>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
