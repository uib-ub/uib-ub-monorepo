"use client";

import AudioPreviewButtons from "@/components/audio/audio-preview-buttons";
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
    audioItems?: Record<string, any>[];
};

export default function ResultCardTitle({
    label,
    cadastrePrefix,
    mobilePreview,
    additionalLabels,
    isInit,
    audioItems,
}: ResultCardTitleProps) {
    const trimmedLabel = (label || "").trim() || "Utan namn";
    const safeAdditionalLabels = Array.isArray(additionalLabels)
        ? (additionalLabels.filter(Boolean) as string[])
        : [];
    const showAllAdditionalLabels = safeAdditionalLabels.length <= 4;
    const visibleAdditionalLabels = showAllAdditionalLabels
        ? safeAdditionalLabels
        : safeAdditionalLabels.slice(0, 3);
    const remainingAdditionalLabelsCount = showAllAdditionalLabels
        ? 0
        : safeAdditionalLabels.length - visibleAdditionalLabels.length;




    return (
        <div className={"flex items-baseline flex-wrap min-w-0 max-w-[calc(100%-2rem)] whitespace-nowrap text-lg xl:text-xl"}>
            {cadastrePrefix && <span className="shrink-0 text-neutral-950">{cadastrePrefix}</span>}
            {isInit ? <h1 className="min-w-0 text-neutral-950 font-sans font-semibold text-lg xl:text-xl max-w-full truncate">{trimmedLabel}</h1>
            : <strong className="min-w-0 text-neutral-950 max-w-full truncate">{trimmedLabel}</strong>}{visibleAdditionalLabels.length > 0 && <span className="text-neutral-700 whitespace-nowrap">&nbsp;&nbsp;|&nbsp;&nbsp; </span>}

            {visibleAdditionalLabels.map((l, i) => (
                <span key={l} className={`text-neutral-700 whitespace-nowrap`}>
                    {l}{i < visibleAdditionalLabels.length - 1 && <>&nbsp;&nbsp;|&nbsp;&nbsp; </> }
                </span>
            ))}
            {remainingAdditionalLabelsCount > 0 && (
                <span className={`text-neutral-700 whitespace-nowrap`}>
                  &nbsp;+&nbsp;{remainingAdditionalLabelsCount}
                </span>
            )}
            {mobilePreview && Array.isArray(audioItems) && audioItems.length > 0 && (
                            <AudioPreviewButtons recordings={audioItems} />
                        )}
        </div>
    );
}
