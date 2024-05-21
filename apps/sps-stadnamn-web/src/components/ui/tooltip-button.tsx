import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"


export default function TooltipButton({ children, className, label, ...rest }: { children: React.ReactNode, className?: string, label: string, [x: string]: any }) {
    return (

        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger className={className} aria-label={label} {...rest}>
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