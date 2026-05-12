"use client"

import { cva } from "class-variance-authority"
import { usePalette, type Palette } from "@/components/theme/palette-provider"
import { useEffect, useState } from 'react'
import { cn } from "@/lib/utils"

const itemVariants = cva('size-6.5 p-1.5 text-fd-muted-foreground', {
  variants: {
    active: {
      true: 'bg-fd-border text-fd-accent-foreground',
      false: 'text-fd-muted-foreground',
    },
  },
});

const full = [['neutral', 'bg-uib-neutral-400'] as const, ['red', 'bg-uib-red-500'] as const];

type PaletteSwitcherProps = {
  className?: string
}

export function PaletteSwitcher({ className }: PaletteSwitcherProps) {
  const { palette, setPalette, availablePalettes } = usePalette()
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const container = cn(
    'inline-flex items-center rounded-full border p-0 *:rounded-full',
    className,
  );

  return (
    <div className={container} data-palette-toggle="">
      {full.map(([key, color]) => (
        <button
          key={key}
          aria-label={key}
          className={cn(itemVariants({ active: palette === key }))}
          onClick={() => setPalette(key)}
        >
          <span className={cn("block size-3 rounded-full", color)} />
        </button>
      ))}
    </div>
  );
}

