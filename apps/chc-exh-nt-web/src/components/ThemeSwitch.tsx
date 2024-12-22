"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cva, type VariantProps } from "class-variance-authority"

import { Button } from "@/src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"

const themeSwitchVariants = cva("h-[1.2rem] w-[1.2rem] transition-all", {
  variants: {
    mode: {
      light: "rotate-0 scale-100 dark:-rotate-90 dark:scale-0",
      dark: "absolute rotate-90 scale-0 dark:rotate-0 dark:scale-100",
    },
    layout: {
      sidebar: "",
      header: "flex gap-2 align-middle",
    },
  },
  defaultVariants: {
    mode: "light",
    layout: "sidebar",
  },
})

interface ThemeSwitchProps extends VariantProps<typeof themeSwitchVariants> {
  className?: string
}

export function ThemeSwitch({ layout, className }: ThemeSwitchProps) {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className={themeSwitchVariants({ mode: "light" })} />
          <Moon className={themeSwitchVariants({ mode: "dark" })} />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side={layout === "sidebar" ? "right" : "bottom"}>
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
