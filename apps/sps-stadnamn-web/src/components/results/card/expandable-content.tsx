"use client";

import { useState } from "react";
import { processHtmlContent } from "./group-utils";
import { useSearchParams } from "next/navigation";
import Clickable from "@/components/ui/clickable/clickable";
import SourceLink from "./source-link";

interface ExpandableContentProps {
    html: string;
    text: string;
    links?: string[];
    leadingLabel?: string;
    forceExpanded?: boolean;
    showToggle?: boolean;
}

// Collapses long content by truncating the text itself
export const ExpandableContent = ({
    html,
    text,
    links,
    leadingLabel,
    forceExpanded,
    showToggle = true,
}: ExpandableContentProps) => {
    const [expanded, setExpanded] = useState(false);

    const fullPlain = (() => {
        if (typeof html === "string" && html) {
            return html.replace(/<[^>]*>/g, "");
        }
        return text || "";
    })();

    const CHAR_THRESHOLD = 300;
    // Only consider it "long" if expanding will at least double the visible text
    const isLong = fullPlain.length > CHAR_THRESHOLD * 2;
    const isExpanded = forceExpanded !== undefined ? forceExpanded : expanded;

    if (!html && !text) return null;

    const searchParams = useSearchParams();
    const sourceView = searchParams.get("sourceView") === "on";

    // Only render processed HTML when fully expanded or when content is short
    const processedHtml = html ? processHtmlContent(html, isExpanded || !isLong) : null;

    const truncatedText = isLong
        ? (() => {
            const slice = fullPlain.slice(0, CHAR_THRESHOLD);
            // Avoid cutting in the middle of a word
            return slice.replace(/\s+\S*$/, "");
        })()
        : fullPlain;

    const shouldShowToggle = isLong && showToggle && forceExpanded === undefined;

    const content = (() => {
        if (isLong && !isExpanded) {
            return `${truncatedText}…`;
        }
        return processedHtml || fullPlain;
    })();

    return (
        <>
            <span>
                {leadingLabel && (
                    <>
                        <span className="font-semibold text-neutral-950">{leadingLabel}</span>
                        <span className="text-neutral-500"> | </span>
                    </>
                )}
                {content}
                {Array.isArray(links) && links.length > 0 && (
                    <>
                        &nbsp;|&nbsp;
                        {links.map((link) => (
                                <SourceLink key={link} url={link} />

                        ))}
                    </>
                )}
            </span>
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

