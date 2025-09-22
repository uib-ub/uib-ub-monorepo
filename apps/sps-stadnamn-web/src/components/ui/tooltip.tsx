"use client"
 
import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
 
import { cn } from "@/lib/utils"
 
const TooltipProvider = TooltipPrimitive.Provider
 
const Tooltip = TooltipPrimitive.Root
 
const TooltipTrigger = TooltipPrimitive.Trigger
 
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, side="bottom", ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    side={side}
    aria-hidden={true}
    className={cn(
      "z-[8001] overflow-hidden rounded-md shadow-md text-white bg-neutral-900 p-1 px-2 text-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName
 
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }