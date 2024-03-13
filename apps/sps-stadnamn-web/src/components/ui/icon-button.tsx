'use client'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"


export default function TooltipButton({ children, className, textClass, label, type, ...rest }: { children: React.ReactNode, className?: string, textClass?: string, label: string, [x: string]: any, type?: "button" | "submit" | "reset" }) {
    return (

        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger className={className} aria-label={label} type={type || "button"} {...rest}>
                    {textClass ? <span className={textClass}>{label}</span> : null}
                    <i  aria-hidden='true'>
                        {children}
                    </i>
                </TooltipTrigger>
                <TooltipContent>
                {label}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

    );
}