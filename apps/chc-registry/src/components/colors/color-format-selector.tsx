"use client"

import * as React from "react"

import { getColorFormat, type Color } from "@/lib/colors"
import { cn } from "@/lib/utils"
import { useColors } from "@/hooks/use-colors"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

export function ColorFormatSelector({
  color,
  className,
  ...props
}: Omit<React.ComponentProps<typeof SelectTrigger>, "color"> & {
  color: Color
}) {
  const { format, setFormat, isLoading } = useColors()
  const formats = React.useMemo(() => getColorFormat(color), [color])

  if (isLoading) {
    return <ColorFormatSelectorSkeleton />
  }

  return (
    <Select
      value={format}
      onValueChange={(nextFormat) => {
        if (nextFormat) {
          setFormat(nextFormat)
        }
      }}
    >
      <SelectTrigger
        size="sm"
        className={cn(
          "border-border bg-background text-foreground shadow-none hover:bg-accent/40 dark:bg-input-foreground dark:hover:bg-input/10",
          className
        )}
        {...props}
      >
        <span className="font-medium">Format:</span>
        <SelectValue className="text-muted-foreground font-mono dark:bg-input-foreground" />
      </SelectTrigger>
      <SelectContent align="end" className="rounded-xl dark:bg-background dark:text-primary-foreground w-fit">
        {Object.entries(formats).map(([format, value]) => (
          <SelectItem
            key={format}
            value={format}
            className={cn(
              "gap-2 rounded-lg flex items-baseline justify-between",
              // Pointer highlight uses data-highlighted (see Base UI Select); descendants get
              // focus:**:text-accent-foreground from select.tsx unless we override with **: …
              "dark:data-highlighted:text-foreground dark:data-highlighted:**:text-foreground",
              "dark:focus:text-foreground dark:focus:**:text-foreground",
            )}
          >
            <span className="font-medium">{format}</span>
            <span className="font-mono text-xs">
              {value}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function ColorFormatSelectorSkeleton({
  className,
  ...props
}: React.ComponentProps<typeof Skeleton>) {
  return (
    <Skeleton
      className={cn("h-8 w-[132px] gap-1.5 rounded-md", className)}
      {...props}
    />
  )
}