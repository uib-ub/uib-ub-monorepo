"use client";

import { useState } from "react";
import { datasetTitles } from "@/config/metadata-config";
import { ExpandableContent } from "./expandable-content";
import SourceLink from "./source-link";

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

                const links = textItem.links;
                const firstLink =
                    Array.isArray(links) && links.length > 0
                        ? links[0]
                        : typeof links === "string" && links
                            ? links
                            : null;
                const remainingLinks =
                    Array.isArray(links) && links.length > 1 ? links.slice(1) : [];

                const datasetLabel = datasetTitles[textItem.dataset] || textItem.dataset;

                return (
                    <div className="px-3 max-w-[calc(100%-1rem)]" key={textItem.uuid + 'text'} id={`text-item-${textItem.uuid}`}>
                        <ExpandableContent
                            leading={
                                <>
                                    {firstLink ? (
                                        <SourceLink url={firstLink} label={datasetLabel} />
                                    ) : (
                                        <strong className="text-neutral-950">{datasetLabel}</strong>
                                    )}
                                    {" | "}
                                </>
                            }
                            html={html}
                            text={text}
                            forceExpanded={shouldForceExpand}
                            showToggle={showToggle}
                        />
                        {remainingLinks.length > 0 && (
                            <div className="mt-1 text-sm text-neutral-900">
                                {remainingLinks.map((link: string) => (
                                    <div key={link}>
                                        <SourceLink url={link} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
            {hasMultipleItems && (
                <button
                    type="button"
                    className="mx-3 mb-3 flex items-center gap-1 text-neutral-900 text-lg"
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

