"use-client"

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const TooltipButton = dynamic(() => import('./tooltip-button'), { ssr: false })

export default function IconButton({ children, className, type='button', label, ...rest }: { children: React.ReactNode, className?: string, label: string, [x: string]: any }) {

  return (
  
    <Suspense fallback={
      <button type={type} className={className} aria-label={label}>
          <i  aria-hidden='true'>
                    {children}
              </i> 
      </button>

    }>
  <TooltipButton className={className} type={type} label={label}  {...rest}>{children}</TooltipButton>
  </Suspense>
    
  );
}