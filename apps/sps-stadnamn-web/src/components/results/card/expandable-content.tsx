"use client";

import { useState } from "react";
import { processHtmlContent } from "./group-utils";
import Clickable from "@/components/ui/clickable/clickable";
import SourceLink from "./source-link";
import { formatHighlight } from "@/lib/text-utils";

interface ExpandableContentProps {
    text: string;
    hasHtmlTags: boolean;
    links?: string[];
    leadingLabel?: string;
    forceExpanded?: boolean;
    showToggle?: boolean;
    isHighlight?: boolean;
}

// Collapses long content by truncating the text itself
export const ExpandableContent = ({
    text,
    hasHtmlTags,
    links,
    leadingLabel,
    forceExpanded,
    showToggle = true,
    isHighlight = false,
}: ExpandableContentProps) => {
    const [expanded, setExpanded] = useState(false);


    const CHAR_THRESHOLD = 300;
    // Only consider it "long" if expanding will at least double the visible text
    const isLong = text.length > CHAR_THRESHOLD * 2;
    const isExpanded = forceExpanded !== undefined ? forceExpanded : expanded;
    const clampStyle = (isExpanded || !isLong) ? {} : {
        display: '-webkit-box',
        WebkitLineClamp: String(4),
        WebkitBoxOrient: 'vertical' as const,
        overflow: 'hidden'
    }

    if (!text) return null;


    // Only render processed HTML when fully expanded or when content is short
    const processedText = isHighlight
        ? formatHighlight(text)
        : hasHtmlTags
            ? processHtmlContent(text, isExpanded || !isLong)
            : text.replace(/<[^>]*>/g, "");



    const shouldShowToggle = isLong && showToggle && forceExpanded === undefined;


    return (
        <>
            <div>
                {leadingLabel && (
                    <>
                        <span className="font-semibold text-neutral-950">{leadingLabel}</span>
                        <span className="text-neutral-500"> | </span>
                    </>
                )}
                <div
                    className="[touch-action:pan-y] select-none [-webkit-user-select:none] [-webkit-touch-callout:none] pointer-events-none"
                    style={clampStyle}
                >
                    {processedText}
                </div>
                {Array.isArray(links) && links.length > 0 && (
                    <>
                        &nbsp;|&nbsp;
                        {links.map((link) => (
                                <SourceLink key={link} url={link} />

                        ))}
                    </>
                )}
            </div>
            {shouldShowToggle && (
                <Clickable
                    className="text-sm text-neutral-900 mt-1.5 mb-0 mr-2 flex items-center gap-1"
                    aria-expanded={expanded}
                    onClick={() => setExpanded(!expanded)}
                >
                    {isExpanded ? "Vis mindre" : "Vis heile"}
                </Clickable>
            )}
        </>
    );
}

