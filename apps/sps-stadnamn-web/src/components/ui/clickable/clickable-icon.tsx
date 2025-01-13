'use client'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { ParamProps } from "./param-types"
import Clickable from './clickable'

type Props = ParamProps & {
    label: string
}

export default function ClickableIcon({ 
    children, 
    label, 
    side="bottom",
    ...rest 
}: Props) {

    
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
