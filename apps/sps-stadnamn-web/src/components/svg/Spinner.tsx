

import { SVGProps } from 'react';

interface SpinnerProps extends SVGProps<SVGSVGElement> {
  status: string;
  className?: string;
}

export default function Spinner({ className, status, ...rest }: SpinnerProps) {
  return (
    <>
    <svg aria-hidden="true" className={`animate-spin text-primary-600 ${className}`}xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...rest}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="fill-neutral-200" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <div role="status" aria-live="polite" className="sr-only">{status}</div>
    </>

  );
}