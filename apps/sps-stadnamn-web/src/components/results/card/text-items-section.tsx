"use client";

import { useState } from "react";
import { datasetTitles } from "@/config/metadata-config";
import { ExpandableContent } from "./expandable-content";
import Clickable from "@/components/ui/clickable/clickable";


export const TextItemsSection = ({ textItems, highlight }: { textItems: any[], highlight?: any }) => {
    const [showAll, setShowAll] = useState(false);

    if (!textItems || textItems.length === 0) return null;

    const hasMultipleItems = textItems.length > 1;
    const highlightedFirstText =
        typeof highlight === "string"
            ? highlight
            : highlight?.["content.html"]?.[0] || highlight?.["content.text"]?.[0];
    const hasHighlightPreview = Boolean(highlightedFirstText);
    const hasHighlightedFirstText = Boolean(!showAll && highlightedFirstText);

    const firstVisibleItem =
        !showAll && highlightedFirstText
            ? { ...textItems[0], text: highlightedFirstText }
            : textItems[0];

    const visibleItems = showAll ? textItems : [firstVisibleItem];
    const hasShowAllControl = hasMultipleItems || hasHighlightPreview;

    const handleShowAll = () => {
        setShowAll(true);
    };

    return (
        <>
            {visibleItems.map((textItem, index) => {
                const isFirstItem = index === 0;
                const shouldForceExpand = showAll ? true : undefined;
                const showToggle = !hasShowAllControl;

                const rawContent = typeof textItem.text === "string" ? textItem.text : "";
                const hasHtmlTags = /<[^>]+>/.test(rawContent);
                const text = hasHtmlTags ? rawContent.replace(/<\/?p>/g, "") : rawContent;


                const rawLinks = textItem.links;
                const links: string[] =
                    Array.isArray(rawLinks) ? rawLinks :
                        typeof rawLinks === "string" && rawLinks ? [rawLinks] : [];

                const datasetLabel = datasetTitles[textItem.dataset] || textItem.dataset;
                const leadingLabel = hasMultipleItems && showAll ? datasetLabel : undefined;

                return (
                    <div className="px-3 max-w-[calc(100%-1rem)]" key={textItem.uuid + 'text'} id={`text-item-${textItem.uuid}`}>
                        <ExpandableContent
                            text={text}
                            hasHtmlTags={hasHtmlTags}
                            links={links}
                            leadingLabel={leadingLabel}
                            forceExpanded={shouldForceExpand}
                            showToggle={showToggle}
                            isHighlight={hasHighlightedFirstText && isFirstItem}
                        />
                    </div>
                );
            })}
            {hasShowAllControl && (
                <Clickable
                    type="button"
                    className="mx-3 mb-3 flex items-center gap-1 text-neutral-900 text-sm"
                    aria-expanded={showAll}
                    aria-controls={`text-items-${textItems.length}`}
                    onClick={showAll ? () => {
                        setShowAll(false);
                    } : handleShowAll}
                >
                    {showAll ? (
                        <>Vis mindre</>
                    ) : hasMultipleItems ? (
                        <>Vis meir (+{textItems.length - 1})</>
                    ) : (
                        <>Vis meir</>
                    )}
                </Clickable>
            )}
        </>
    );
}

