import { useMemo } from 'react';

type PercentageCircleProps = {
  count: number;
  total: number;
  size?: string; // e.g. "1em", "24px", "2rem"
};

export default function PercentageCircle({ count, total, size = "1.25em" }: PercentageCircleProps) {
  const percentage = useMemo(() => Math.round((count / total) * 100), [count, total]);
  // Increase radius for more space
  const radius = 10;
  const center = 12;
  const circumference = 2 * Math.PI * radius;
  const dash = (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="inline-block">
      <circle
        r={radius}
        cx={center}
        cy={center}
        fill="transparent"
        stroke="currentColor"
        strokeWidth="3"
        className="opacity-20"
      />
      <circle
        r={radius}
        cx={center}
        cy={center}
        fill="transparent"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray={`${dash} ${circumference - dash}`}
        transform={`rotate(-90 ${center} ${center})`}
      />
    </svg>
  );
}