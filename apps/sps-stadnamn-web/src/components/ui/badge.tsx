import { formatNumber } from "@/lib/utils";

export default function Badge({ count }: { count: number }) {
    return (
      <span className="inline-flex items-center justify-center min-w-[1.75rem] bg-white group-aria-pressed:bg-accent-800 group-aria-pressed:text-white text-neutral-900 border border-neutral-300 shadow-sm text-xs px-2 py-[1px] rounded-full">
      {formatNumber(count)}
    </span>
    );
  };