import { cn } from '@/lib/utils';

export function ContentGrid({ className, children }: { className?: string, children: React.ReactNode }) {
  return <div className={cn('content-grid', className)} >{children}</div>;
}