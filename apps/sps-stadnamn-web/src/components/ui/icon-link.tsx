'use client'
import { useRouter } from 'next/navigation'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
import Link from 'next/link';


export default function IconLink({ children, textClass, textIcon, label, type, href, ...rest }: 
    { children: React.ReactNode, textClass?: string, textIcon?: boolean, label: string, href: string, [x: string]: any }) {
    
    return (

        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link aria-label={label} href={href} {...rest}>
                    {textClass ? <span aria-hidden="true" className={textClass}>{label}</span> : null}
                    {textIcon ? <span aria-hidden="true" className='flex'>{children}</span> : <i  aria-hidden='true'>{children}</i>}
                    </Link>
                </TooltipTrigger>
                <TooltipContent>
                {label}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

    );
}