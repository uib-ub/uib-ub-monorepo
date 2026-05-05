'use client';

type DistanceBadgeProps = {
  meters?: number | null;
  className?: string;
};

export const formatDistance = (meters: number) => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${Math.round(meters / 1000)} km`;
};

export default function DistanceBadge({ meters, className }: DistanceBadgeProps) {
  if (typeof meters !== 'number' || !Number.isFinite(meters)) {
    return null;
  }

  return (
    <span
      className={`bg-neutral-200 text-neutral-900 px-2 rounded-full text-nowrap shrink-0 text-base ${className || ''}`}
    >
      {formatDistance(meters)}
    </span>
  );
}

