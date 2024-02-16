"use-client"

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const TooltipButton = dynamic(() => import('./tooltip-button'), { ssr: false })

export default function IconButton({ children, className, textClass, type='button', label, ...rest }: { children: React.ReactNode, className?: string, textClass?: string, label: string, [x: string]: any }) {

  return (
  
    <Suspense fallback={
      <button type={type} className={className} aria-label={textClass ? undefined : label}>
        {textClass ? <span className={textClass}>{label}</span> : null}
          <i  aria-hidden='true'>
                    {children}
              </i> 
      </button>

    }>
  <TooltipButton className={className} type={type} textClass={textClass} label={label}  {...rest}>{children}</TooltipButton>
  </Suspense>
    
  );
}