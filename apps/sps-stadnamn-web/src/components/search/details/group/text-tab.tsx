"use client";

import { useState } from "react";
import { datasetTitles } from "@/config/metadata-config";
import { ExpandableContent } from "./expandable-content";
import WarningMessage from "./warning-message";

interface TextTabProps {
    textItems: any[];
}

export const TextTab = ({ textItems }: TextTabProps) => {
    const [showAll, setShowAll] = useState(false);
    const [firstItemExpanded, setFirstItemExpanded] = useState(false);

    if (!textItems || textItems.length === 0) return null;

    const visibleItems = showAll ? textItems : textItems.slice(0, 1);
    const hasMultipleItems = textItems.length > 1;

    const handleShowAll = () => {
        setShowAll(true);
        // Expand the first item when showing all
        setFirstItemExpanded(true);
    };

    return (
        <>
            {visibleItems.map((textItem, index) => {
                const isFirstItem = index === 0;
                const isHiddenItem = hasMultipleItems && showAll && index > 0;
                // For the first item: if there are multiple items and we've clicked "show all", expand it
                // For hidden items (index > 0 when showAll is true): always show fully expanded (no shortening)
                const shouldForceExpand = hasMultipleItems && showAll && isFirstItem
                    ? firstItemExpanded
                    : isHiddenItem
                        ? true
                        : undefined;
                // Show "Vis heile" toggle only if there's a single item
                // If there are multiple items, don't show toggle on first item
                const showToggle = !hasMultipleItems;

                return (
                    <div className="py-3 px-3" key={textItem.uuid + 'text'} id={`text-item-${textItem.uuid}`}>
                        {false && textItem.dataset === 'rygh' && (
                            <WarningMessage
                                message="Feil i Norske Gaardnavne"
                                messageId="rygh-phonetic-warning"
                            >
                                <div>
                                    Den digitale utgåva av Norske Gaardnavne kan innehalde feil. Sjå trykt utgåve på nb.no.
                                    <ul className="list-disc pl-6 py-2 space-y-2">
                                        <li className="break-words">Feil i lydskrift</li>
                                        <li className="break-words">Ord som ikkje er namn kan førekoma i tidslinjene Språksamlingane har henta ut</li>
                                    </ul>

                                </div>
                            </WarningMessage>
                        )}
                        <ExpandableContent
                            leading={<><strong className="text-neutral-950">{datasetTitles[textItem.dataset]}</strong> | </>}
                            html={(textItem.content.html ? textItem.content.html.replace(/<\/?p>/g, '') : textItem.content.html) || null}
                            text={textItem.content?.text || null}
                            forceExpanded={shouldForceExpand}
                            showToggle={showToggle}
                        />

                    </div>
                );
            })}
            {hasMultipleItems && (
                <button
                    type="button"
                    className="mx-3 flex items-center gap-1 text-neutral-900 text-lg"
                    aria-expanded={showAll}
                    aria-controls={`text-items-${textItems.length}`}
                    onClick={showAll ? () => {
                        setShowAll(false);
                        setFirstItemExpanded(false);
                    } : handleShowAll}
                >
                    {showAll ? <>Vis mindre tekstinnhald</> : <>Vis meir tekstinnhald (+{textItems.length - 1})</>}
                </button>
            )}
        </>
    );
}

