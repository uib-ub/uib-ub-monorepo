import dynamic from 'next/dynamic'

export default function IconButton({ children, className, textClass, type='button', label, ...rest }: { children: React.ReactNode, className?: string, textClass?: string, label: string, [x: string]: any }) {
  const TooltipButton = dynamic(() => import('./tooltip-button'), { ssr: false ,
    loading: () => (
        <button type={type} className={className} aria-label={textClass ? undefined : label}>
          {textClass ? <span className={textClass}>{label}</span> : null}
            <i  aria-hidden='true'>
                      {children}
                </i> 
        </button>
      )
  })
  

  return (
    <TooltipButton className={className} type={type} textClass={textClass} label={label}  {...rest}>{children}</TooltipButton>
    
  );
}