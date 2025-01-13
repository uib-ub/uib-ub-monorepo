'use client'
import { GlobalContext } from "@/app/global-provider";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
import { useContext } from "react";

/*
Tooltip button without route handling
 */

export default function IconButton({ children, label, type, side = 'bottom', onClick, ...rest }: 
    { children: React.ReactNode, className?: string, label: string, side?: "bottom" | "left" | "right" | "top", [x: string]: any, type?: "button" | "submit" | "reset" }) {
        const { isMobile } = useContext(GlobalContext)

        if (isMobile) {
            return <button aria-label={label} type={type || "button"} onClick={onClick} {...rest}><i aria-hidden='true'>{children}</i></button>
        }
        else {
            return (

        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button aria-label={label} type={type || "button"} onClick={onClick} {...rest}>
                     <i  aria-hidden='true'>{children}</i>
                    </button>
                </TooltipTrigger>
                <TooltipContent side={side}>
                {label}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

    );
}
}