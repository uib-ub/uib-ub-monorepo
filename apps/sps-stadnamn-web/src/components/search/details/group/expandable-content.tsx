"use client";

import { useState, type ReactNode } from "react";
import { processHtmlContent } from "./group-utils";
import { useSearchParams } from "next/navigation";

interface ExpandableContentProps {
    html: string;
    text: string;
    clampLines?: number;
    leading?: ReactNode;
    forceExpanded?: boolean;
    showToggle?: boolean;
}

// Collapses long HTML to a few lines with a toggle
export const ExpandableContent = ({
    html,
    text,
    clampLines = 4,
    leading,
    forceExpanded,
    showToggle = true
}: ExpandableContentProps) => {
    const [expanded, setExpanded] = useState(false)
    const plain = typeof html === 'string' ? html.replace(/<[^>]*>/g, '') : ''
    const isLong = (plain || '').length > 300
    const isExpanded = forceExpanded !== undefined ? forceExpanded : expanded
    const clampStyle = isExpanded || !isLong ? {} : {
        display: '-webkit-box',
        WebkitLineClamp: String(clampLines),
        WebkitBoxOrient: 'vertical' as const,
        overflow: 'hidden'
    }
    if (!html && !text) return null;
    const searchParams = useSearchParams()
    const noGrouping = searchParams.get('noGrouping') === 'on'

    const processedHtml = html ? processHtmlContent(html, isExpanded) : null;

    return (
        <>
            <span style={clampStyle}>
                {!noGrouping && leading}
                {processedHtml || text}
            </span>
            {isLong && showToggle && forceExpanded === undefined && (
                <button
                    type="button"
                    className="text-sm text-neutral-900 mt-1.5 mb-0 mr-2 flex items-center gap-1"
                    aria-expanded={expanded}
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? 'Vis mindre' : 'Vis heile'}
                </button>
            )}
        </>
    )
}

