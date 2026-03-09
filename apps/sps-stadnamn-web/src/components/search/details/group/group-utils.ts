import type { ReactNode } from "react";
import { formatHtml } from "@/lib/text-utils";

// Helper function to process HTML content
export const processHtmlContent = (html: string, expanded: boolean): ReactNode => {
    // Remove <p> tags
    let htmlNoP = html.replace(/<\/?p>/g, '');
    // Remove a single wrapping tag (e.g., <div>...</div> or <span>...</span>)
    htmlNoP = htmlNoP.trim().replace(/^<([a-zA-Z0-9]+)[^>]*>([\s\S]*)<\/\1>$/i, '$2');
    return formatHtml(expanded ? html : htmlNoP);
}

// Helper functions for filtering sources
export const matchesActiveYear = (s: any, activeYear: string | null) => {
    if (!activeYear) return true
    if (String(s?.year) === activeYear) return true
    if (Array.isArray(s?.attestations)) {
        if (s.attestations.some((a: any) => String(a?.year) === activeYear)) return true
    }
    return false
}

export const matchesActiveName = (s: any, activeName: string | null) => {
    if (!activeName) return true
    if (s?.label && String(s.label) === activeName) return true
    if (Array.isArray(s?.altLabels)) {
        if (s.altLabels.some((al: any) => String(typeof al === 'string' ? al : al?.label) === activeName)) return true
    }
    if (Array.isArray(s?.attestations)) {
        if (s.attestations.some((a: any) => String(a?.label) === activeName)) return true
    }
    return false
}

// Helper function to push name-year pairs
export const pushNameYear = (nameToYears: Record<string, Set<string>>, name: string | undefined, year: any) => {
    if (!name) return
    const y = year != null ? String(year) : null
    if (!y) return
    nameToYears[name] = nameToYears[name] || new Set<string>()
    nameToYears[name].add(y)
}

type InitDocData = {
    _source?: {
        label?: unknown
        altLabels?: unknown[]
        attestations?: Array<{ label?: unknown } | null | undefined>
    }
} | null | undefined

type InitGroupData = {
    fields?: {
        label?: unknown[]
        altLabels?: unknown[]
    }
    sources?: Array<{
        label?: unknown
        altLabels?: unknown[]
        attestations?: Array<{ label?: unknown } | null | undefined>
    }>
} | null | undefined

type AlternativeInitLabelsArgs = {
    sourceView: boolean
    initDocData?: InitDocData
    initGroupData?: InitGroupData
    currentQuery?: string | null
    initSearchLabel?: string | null
    maxLabels?: number
}

const getNormalizedLabel = (value: unknown): string | null => {
    if (typeof value === "string") {
        const trimmed = value.trim()
        return trimmed || null
    }
    if (typeof value === "object" && value && "label" in value) {
        const nested = (value as { label?: unknown }).label
        if (typeof nested === "string") {
            const trimmed = nested.trim()
            return trimmed || null
        }
    }
    return null
}

const pushUniqueLabel = (labels: string[], seen: Set<string>, value: unknown) => {
    const label = getNormalizedLabel(value)
    if (!label) return
    const key = label.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    labels.push(label)
}

export const getAlternativeInitLabels = ({
    sourceView,
    initDocData,
    initGroupData,
    currentQuery,
    initSearchLabel,
    maxLabels = 8,
}: AlternativeInitLabelsArgs): string[] => {
    const labels: string[] = []
    const seen = new Set<string>()

    if (sourceView) {
        const source = initDocData?._source
        pushUniqueLabel(labels, seen, source?.label)
        ;(source?.altLabels ?? []).forEach((value) => pushUniqueLabel(labels, seen, value))
        ;(source?.attestations ?? []).forEach((att) => pushUniqueLabel(labels, seen, att?.label))
    } else {
        pushUniqueLabel(labels, seen, initGroupData?.fields?.label?.[0])
        ;(initGroupData?.fields?.altLabels ?? []).forEach((value) => pushUniqueLabel(labels, seen, value))
        ;(initGroupData?.sources ?? []).forEach((source) => {
            pushUniqueLabel(labels, seen, source?.label)
            ;(source?.altLabels ?? []).forEach((value) => pushUniqueLabel(labels, seen, value))
            ;(source?.attestations ?? []).forEach((att) => pushUniqueLabel(labels, seen, att?.label))
        })
    }

    const queryKey = (currentQuery || "").trim().toLowerCase()
    const initLabelKey = (initSearchLabel || "").trim().toLowerCase()

    return labels
        .filter((label) => {
            const key = label.toLowerCase()
            return key !== queryKey && key !== initLabelKey
        })
        .slice(0, Math.max(maxLabels, 0))
}

