"use client";

import { useState } from "react";
import { datasetTitles } from "@/config/metadata-config";
import { ExpandableContent } from "./expandable-content";
import SourceLink from "./source-link";
import Clickable from "@/components/ui/clickable/clickable";

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

                const rawContent =
                    textItem.content?.html ??
                    textItem.content?.text ??
                    textItem.html ??
                    textItem.text ??
                    "";
                const hasHtmlTags = /<[^>]+>/.test(rawContent);
                const html = hasHtmlTags ? rawContent.replace(/<\/?p>/g, "") : "";
                const text = hasHtmlTags ? "" : rawContent;

                const rawLinks = textItem.links;
                const links: string[] =
                    Array.isArray(rawLinks) ? rawLinks :
                        typeof rawLinks === "string" && rawLinks ? [rawLinks] : [];

                const datasetLabel = datasetTitles[textItem.dataset] || textItem.dataset;
                const leadingLabel = hasMultipleItems && showAll ? datasetLabel : undefined;

                return (
                    <div className="px-3 max-w-[calc(100%-1rem)]" key={textItem.uuid + 'text'} id={`text-item-${textItem.uuid}`}>
                        <ExpandableContent
                            html={html}
                            text={text}
                            links={links}
                            leadingLabel={leadingLabel}
                            forceExpanded={shouldForceExpand}
                            showToggle={showToggle}
                        />
                    </div>
                );
            })}
            {hasMultipleItems && (
                <Clickable
                    type="button"
                    className="mx-3 mb-3 flex items-center gap-1 text-neutral-900 text-sm"
                    aria-expanded={showAll}
                    aria-controls={`text-items-${textItems.length}`}
                    onClick={showAll ? () => {
                        setShowAll(false);
                        setFirstItemExpanded(false);
                    } : handleShowAll}
                >
                    {showAll ? <>Vis færre</> : <>Vis fleire (+{textItems.length - 1})</>}
                </Clickable>
            )}
        </>
    );
}

