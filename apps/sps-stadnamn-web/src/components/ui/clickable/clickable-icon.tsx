'use client'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { ParamProps } from "./param-types"
import Clickable from './clickable'
import { useContext } from "react"
import { GlobalContext } from "@/app/global-provider"

type Props = ParamProps & {
    label: string
}

export default function ClickableIcon({ 
    children, 
    label, 
    type,
    onClick,
    side="bottom",
    ...rest 
}: Props) {

    const { isMobile } = useContext(GlobalContext)

    if (isMobile) {
        return <button aria-label={label} type={type || "button"} onClick={onClick} {...rest}><i aria-hidden='true'>{children}</i></button>
    }
    else {
        return (
            <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Clickable 
                        aria-label={label} 
                        {...rest}
                    >
                        <i aria-hidden='true'>{children}</i>
                    </Clickable>
                </TooltipTrigger>
                <TooltipContent side={side}>
                    {label}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        );
    }
}
