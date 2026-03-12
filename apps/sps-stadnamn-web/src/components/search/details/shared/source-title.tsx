"use client";

import { cn } from "@/lib/utils";

type SourceTitleProps = {
    label: string;
    cadastrePrefix: string;
    mobilePreview: boolean;
    additionalLabels: string[];
    className?: string;
    labelClassName?: string;
    sosiTypes?: string[];
    sosiLimit?: number;
    sosiClassName?: string;
};

export default function SourceTitle({
    label,
    cadastrePrefix,
    mobilePreview,
    additionalLabels,
}: SourceTitleProps) {
    const trimmedLabel = (label || "").trim() || "Utan namn";
    const safeAdditionalLabels = Array.isArray(additionalLabels)
        ? (additionalLabels.filter(Boolean) as string[])
        : [];
    const showAllAdditionalLabels = safeAdditionalLabels.length <= 3;
    const visibleAdditionalLabels = showAllAdditionalLabels
        ? safeAdditionalLabels
        : safeAdditionalLabels.slice(0, 2);
    const remainingAdditionalLabelsCount = showAllAdditionalLabels
        ? 0
        : safeAdditionalLabels.length - visibleAdditionalLabels.length;


    return (
        <span className={cn("flex items-baseline flex-wrap gap-2 min-w-0 max-w-full", ` ${mobilePreview ? 'text-base' : 'text-xl'}`)}>
            {cadastrePrefix && <span className="shrink-0 text-neutral-950">{cadastrePrefix}</span>}
            <strong className="min-w-0 text-neutral-950">{trimmedLabel}</strong>

            {visibleAdditionalLabels.map((l) => (
                <em key={l} className={`text-neutral-700 whitespace-nowrap ${mobilePreview ? 'text-sm' : 'text-base'}`}>
                    {l}
                </em>
            ))}
            {remainingAdditionalLabelsCount > 0 && (
                <em className={`text-neutral-700 whitespace-nowrap ${mobilePreview ? 'text-sm' : 'text-base'}`}>
                    + {remainingAdditionalLabelsCount} andre
                </em>
            )}
        </span>
    );
}
