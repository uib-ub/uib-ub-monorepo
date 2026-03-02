"use client"

import * as React from "react"

import { usePalette, type Palette } from "@/components/theme/palette-provider"
import { cn } from "@/lib/utils"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const LABELS: Record<Palette, string> = {
  red: "Red",
  blue: "Blue",
  green: "Green",
}

type PaletteSwitcherProps = {
  className?: string
}

export function PaletteSwitcher({ className }: PaletteSwitcherProps) {
  const { palette, setPalette, availablePalettes } = usePalette()

  return (
    <ToggleGroup
      type="single"
      value={palette}
      onValueChange={(value) => {
        if (!value) return
        setPalette(value as Palette)
      }}
      spacing={0}
      aria-label="Color palette"
      className={cn("text-xs", className)}
    >
      {availablePalettes.map((p) => (
        <ToggleGroupItem key={p} value={p} aria-label={LABELS[p]}>
          {LABELS[p]}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

