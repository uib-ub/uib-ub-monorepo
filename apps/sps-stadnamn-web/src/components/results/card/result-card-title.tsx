"use client";

import { useInitParam } from "@/lib/param-hooks";
import { cn } from "@/lib/utils";

type ResultCardTitleProps = {
    label: string;
    cadastrePrefix: string;
    mobilePreview: boolean | undefined;
    additionalLabels: string[];
    className?: string;
    labelClassName?: string;
    sosiTypes?: string[];
    sosiLimit?: number;
    sosiClassName?: string;
    isInit?: boolean;
};

export default function ResultCardTitle({
    label,
    cadastrePrefix,
    mobilePreview,
    additionalLabels,
    isInit,
}: ResultCardTitleProps) {
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
            {isInit ? <h1 className="min-w-0 text-neutral-950 mr-2">{trimmedLabel}</h1>
            : <strong className="min-w-0 text-neutral-950">{trimmedLabel}</strong>}

            {visibleAdditionalLabels.map((l, i) => (
                <span key={l} className={`text-neutral-800 whitespace-nowrap ${mobilePreview ? 'text-sm' : 'text-base'}`}>
                    {l}{i < visibleAdditionalLabels.length - 1 && ' | '}
                </span>
            ))}
            {remainingAdditionalLabelsCount > 0 && (
                <span className={`text-neutral-800 whitespace-nowrap ${mobilePreview ? 'text-sm' : 'text-base'}`}>
                    + {remainingAdditionalLabelsCount} andre
                </span>
            )}
        </span>
    );
}
