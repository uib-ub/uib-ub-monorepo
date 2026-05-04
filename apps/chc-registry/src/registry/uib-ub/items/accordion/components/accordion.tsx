"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"

import { cn } from "@/lib/utils"

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      multiple
      data-slot="accordion"
      className={cn(
        "not-prose border-y-2 border-accordion-border dark:border-accordion-border-active",
        // Adds vertical margin if a parent Accordion exists
        '[&_[data-slot="accordion"]]:my-5',
        className
      )}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b-2 border-accordion-border last:border-b-0 data-open:bg-accordion-summary", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-center gap-3 py-4 font-medium transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180 ",
          "group hover:bg-accordion-summary-active text-foreground hover:text-accordion-summary-foreground-active p-2 pb-3",
          className
        )}
        {...props}
      >
        <ChevronDownIcon className="text-foreground group-hover:text-accordion-summary-foreground-active pointer-events-none size-6 shrink-0 translate-y-0.5 transition-transform duration-200 group-data-panel-open:rotate-180" />
        {children}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Panel>) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="not-prose data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down  overflow-hidden"
      {...props}
    >
      <div className={cn("pb-5 ms-11 me-5", className)}>{children}</div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
