'use client'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { GlobalContext } from "@/state/providers/global-provider"
import Link from 'next/link'
import { useContext } from "react"

// Icon link with tooltip that only requires href

export default function IconLink({ children, label, href, side = 'bottom', ...rest }:
    { children: React.ReactNode, label: string, href: string, side?: "bottom" | "left" | "right" | "top", [x: string]: any }) {
    const { isMobile } = useContext(GlobalContext)

    if (isMobile) {
        return <Link href={href} aria-label={label} {...rest}><i aria-hidden='true'>{children}</i></Link>
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href={href} aria-label={label} {...rest}>
                        <i aria-hidden='true'>{children}</i>
                    </Link>
                </TooltipTrigger>
                <TooltipContent side={side}>
                    {label}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}