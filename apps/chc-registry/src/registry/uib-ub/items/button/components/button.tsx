import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Button as ButtonPrimitive } from "@base-ui/react/button"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-button-primary text-button-primary-foreground hover:bg-button-primary-active",
        destructive:
          "text-button-tertiary-foreground hover:bg-button-tertiary-active hover:dark:bg-button-secondary-active",
        outline:
          "dark:text-button-secondary-foreground bg-transparent hover:dark:bg-button-secondary-active border-2 border-button-border-secondary hover:border-button-border-secondary-active text-secondary-foreground hover:bg-button-secondary-active",
        secondary:
          "dark:text-button-secondary-foreground bg-transparent hover:dark:bg-button-secondary-active border-2 border-button-border-secondary hover:border-button-border-secondary-active text-secondary-foreground hover:bg-button-secondary-active",
        ghost:
          "text-button-tertiary-foreground hover:bg-button-tertiary-active hover:dark:bg-button-secondary-active",
        link: "text-primary underline-offset-4 underline hover:cursor-pointer",
      },
      size: {
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-md text-sm gap-1.5 px-3 has-[>svg]:px-2.5",
        default: "h-12 px-4 py-4 has-[>svg]:px-4",
        lg: "h-14 text-lg rounded-md px-6 has-[>svg]:px-4",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        icon: "size-12",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
