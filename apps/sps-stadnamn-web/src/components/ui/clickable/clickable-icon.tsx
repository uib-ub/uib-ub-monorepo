'use client'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { GlobalContext } from "@/state/providers/global-provider"
import { useContext } from "react"
import Clickable from './clickable'
import { ParamProps } from "./param-types"

type Props = ParamProps & {
    label: string
}

export default function ClickableIcon({
    children,
    label,
    side = "bottom",
    ...rest
}: Props) {

    const { isMobile } = useContext(GlobalContext)

    if (isMobile) {
        return <Clickable aria-label={label} {...rest}><span aria-hidden='true'>{children}</span></Clickable>
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
                            <span aria-hidden='true'>{children}</span>
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
