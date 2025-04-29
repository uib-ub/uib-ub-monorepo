'use client'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import Link from "next/link"



export default function ExternalLinkTooltip({ 
    children, 
    description,
    href,
    side = "bottom",
    ...rest 
}: {
    children: React.ReactNode, 
    description: string, 
    href: string, 
    side?: "bottom" | "left" | "right" | "top"
} & React.ComponentPropsWithoutRef<typeof Link>) {

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href={href} target="_blank" rel="noopener noreferrer" {...rest}>{children}</Link>
                </TooltipTrigger>
                <TooltipContent side={side} >
                    <div className="max-w-[16rem]">{description}</div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        );
    
}
