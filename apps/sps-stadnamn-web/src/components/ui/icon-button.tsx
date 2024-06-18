'use client'
import { useRouter } from 'next/navigation'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"


export default function TooltipButton({ children, className, textClass, textIcon, label, type, href, ...rest }: { children: React.ReactNode, className?: string, textClass?: string, textIcon?: boolean, label: string, href?: string, [x: string]: any, type?: "button" | "submit" | "reset" }) {
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
                <TooltipTrigger className={className} type={type || "button"} onClick={handleClick} {...rest}>
                    <span className="sr-only">{label}</span>
                    {textClass ? <span aria-hidden='true' className={textClass}>{label}</span> : null}
                    {textIcon ? children : <i  aria-hidden='true'>{children}</i>
                }
                </TooltipTrigger>
                <TooltipContent>
                {label}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

    );
}