import { formatNumber } from "@/lib/utils";
import { twMerge } from "tailwind-merge";

export function Badge({ count, className }: { count: number, className?: string }) {
  return (
    <span className={twMerge(`flex ${count < 10 ? 'px-1.5' : 'px-1'} rounded-full`, className)}>
    {formatNumber(count)}
  </span>
  );
}


export function TitleBadge({ count, className }: { count: number, className?: string }) {
  return (
    <span className={twMerge(`flex ${count < 10 ? 'px-2' : 'px-1.5'} rounded-full`, className)}>
    {formatNumber(count)}
  </span>
  );
}


export function FacetBadge({ count }: { count: number }) {
    return (
      <span className="inline-flex items-center justify-center min-w-[1.75rem] bg-neutral-50 text-neutral-800 group-aria-pressed:bg-accent-800 group-aria-pressed:text-white text-black ml-2  text-xs px-2 py-[1px] rounded-full">
      {formatNumber(count)}
    </span>
    );
  };