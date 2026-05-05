import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const heroCardVariants = cva(
  /* "grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:gap-16 md:p-16 md:[> img]:grid-col-start-1 md:[> div]:grid-col-start-2 bg-card text-card-background rounded-md", */
  [
    "grid grid-cols-[initial] grid-flow-row-dense md:grid-rows-1 md:grid-cols-2 p-8  md:px-16 md:py-8 bg-card text-card-background rounded-md",
    "[grid-template-areas:'left''right'] md:[grid-template-areas:'left_right']",
    "[&_h1,&_h2,&_h3,&_h4,&_h5,&_h6]:mt-0 pt-0] items-center",
    "gap-[clamp(2rem,5.33vw,4rem)]"
  ],
  {
    variants: {
      image: {
        right: "[&_img]:[grid-area:right] md:[&_img]:[grid-area:right] md:[&_div]:[grid-area:left]",
        left: "[&_img]:[grid-area:left] md:[&_img]:[grid-area:left] md:[&_div]:[grid-area:right]",
      },
    },
    defaultVariants: { image: "right" },
  }
);

function HeroCard({
  className,
  image = "right",
  children,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof heroCardVariants> & { children: React.ReactNode }) {
  return (
    <div
      className={cn(heroCardVariants({ image, className }))}
      {...props}
    >
      {children}
    </div>
  )
}



export { HeroCard }