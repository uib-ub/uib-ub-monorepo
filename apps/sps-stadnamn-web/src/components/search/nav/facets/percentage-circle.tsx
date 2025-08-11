import { useMemo } from 'react';

export default function PercentageCircle({ count, total }: { count: number, total: number }) {
  const percentage = useMemo(() => Math.round((count / total) * 100), [count, total]);
  
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="inline-block">
        <circle
          r="6"
          cx="8"
          cy="8"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="2"
          className="opacity-20"
        />
        <circle
          r="6"
          cx="8"
          cy="8"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray={`${percentage * 0.377} 100`}
          transform="rotate(-90 8 8)"
        />
      </svg>
  );
}