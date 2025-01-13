'use client'
import { useRouter } from 'next/navigation'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"


export default function IconButton({ children, label, type, side = 'bottom', href, ...rest }: 
    { children: React.ReactNode, className?: string, label: string, href?: string, side?: "bottom" | "left" | "right" | "top", [x: string]: any, type?: "button" | "submit" | "reset" }) {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent) => {
        if (href) {
            e.preventDefault();
            router.push(href);
        }
    };
    
    return (

        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button aria-label={label} type={type || "button"} onClick={handleClick} {...rest}>
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