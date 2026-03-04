"use client";

import { cn } from "@/lib/utils";

interface SourceTitleProps {
    label?: string | null;
    cadastrePrefix?: string | null;
    sosiTypes?: string[];
    sosiLimit?: number;
    className?: string;
    labelClassName?: string;
    sosiClassName?: string;
}

export default function SourceTitle({
    label,
    cadastrePrefix,
    sosiTypes = [],
    sosiLimit,
    className,
    labelClassName,
    sosiClassName,
}: SourceTitleProps) {
    const trimmedLabel = (label || "").trim() || "Utan namn";
    const visibleSosi =
        typeof sosiLimit === "number" && sosiLimit >= 0 ? sosiTypes.slice(0, sosiLimit) : sosiTypes;
    const hasMoreSosi = typeof sosiLimit === "number" && sosiLimit >= 0 && sosiTypes.length > sosiLimit;
    const sosiText = visibleSosi.join(", ");

    return (
        <span className={cn("flex items-baseline gap-1 min-w-0 max-w-full", className)}>
            {cadastrePrefix && <span className="shrink-0 text-neutral-950">{cadastrePrefix}</span>}
            <strong className={cn("min-w-0 text-neutral-950", labelClassName)}>{trimmedLabel}</strong>
            {sosiText && (
                <span className={cn("min-w-0 text-neutral-700", sosiClassName)}>
                    {sosiText}
                    {hasMoreSosi ? "..." : ""}
                </span>
            )}
        </span>
    );
}
