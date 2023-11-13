"use client"

import { CommandInput, CommandGroup, CommandDialog, CommandList, CommandEmpty, CommandItem } from '@/components/ui/command'
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { cn, path } from '@/lib/utils'
import { Button } from './ui/button'

export function GlobalCommand({ data }: Readonly<{ data: any[] }>) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-24 lg:w-32"
        )}
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">Søk...</span>
        <span className="inline-flex lg:hidden">Søk...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Søk etter person, gruppe, prosjekt eller software..." />
        <CommandList>
          <CommandEmpty>Fant ikke noe...</CommandEmpty>
          <CommandGroup heading="Forslag">
            {data.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => {
                  runCommand(() => router.push(`/${path[item.type]}/${item.id}` as string))
                }}
                className='flex justify-between items-center'
              >
                {item.label}
                <Badge variant={'outline'}>{item.type}</Badge>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
