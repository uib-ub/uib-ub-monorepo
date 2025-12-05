import Spinner from "@/components/svg/Spinner";
import Clickable from "@/components/ui/clickable/clickable";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import { datasetTitles } from "@/config/metadata-config";
import { defaultResultRenderer, resultRenderers } from "@/config/result-renderers";
import { fitBoundsToGroupSources } from "@/lib/map-utils";
import { useGroup } from "@/lib/param-hooks";
import { stringToBase64Url } from "@/lib/param-utils";
import { formatHtml } from "@/lib/text-utils";
import useGroupData from "@/state/hooks/group-data";
import { GlobalContext } from "@/state/providers/global-provider";
import { useSessionStore } from "@/state/zustand/session-store";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Fragment, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { PiArchive, PiCaretLeftBold, PiCaretRightBold, PiInfoFill, PiMapPinBold, PiMapPinFill, PiMapPinPlusFill, PiPushPinFill, PiX } from "react-icons/pi";
import Carousel from "../../nav/results/carousel";
import WarningMessage from "./warning-message";

// Helper function to process HTML content
const processHtmlContent = (html: string, expanded: boolean): ReactNode => {
    // Remove <p> tags
    let htmlNoP = html.replace(/<\/?p>/g, '');
    // Remove a single wrapping tag (e.g., <div>...</div> or <span>...</span>)
    htmlNoP = htmlNoP.trim().replace(/^<([a-zA-Z0-9]+)[^>]*>([\s\S]*)<\/\1>$/i, '$2');
    return formatHtml(expanded ? html : htmlNoP);
}

// Collapses long HTML to a few lines with a toggle
const ExpandableContent = (
    { html, text, clampLines = 4, leading, forceExpanded, showToggle = true }: { html: string, text: string, clampLines?: number, leading?: ReactNode, forceExpanded?: boolean, showToggle?: boolean }
) => {
    const [expanded, setExpanded] = useState(false)
    const plain = typeof html === 'string' ? html.replace(/<[^>]*>/g, '') : ''
    const isLong = (plain || '').length > 300
    const isExpanded = forceExpanded !== undefined ? forceExpanded : expanded
    const clampStyle = isExpanded || !isLong ? {} : {
        display: '-webkit-box',
        WebkitLineClamp: String(clampLines),
        WebkitBoxOrient: 'vertical' as any,
        overflow: 'hidden'
    }
    if (!html && !text) return null;

    const processedHtml = html ? processHtmlContent(html, isExpanded) : null;

    return (
        <>
            <span style={clampStyle}>
                {leading}
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


const TextTab = ({ textItems }: { textItems: any[] }) => {
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
                        {textItem.dataset === 'rygh' && (
                            <WarningMessage
                                message="Feil i Norske Gaardnavne"
                                messageId="rygh-phonetic-warning"
                            >
                                <div>
                                    Den digitale utgåva av Norske Gaardnavne frå dokumentasjonsprosjektet kan innehalde avvik frå originalen. Sjå trykt utgåve på nb.no.
                                    <ul className="list-disc pl-6 py-2 space-y-2">
                                        <li className="break-words">Feil i lydskrift</li>
                                        <li className="break-words">Inkonsekvent koding av namneformer – ord som ikkje er namn kan førekoma i tidslinjene Språksamlingane har henta ut</li>
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
                    className="mx-3 flex items-center gap-1 text-neutral-900 text-lg mb-4"
                    aria-expanded={showAll}
                    aria-controls={`text-items-${textItems.length}`}
                    onClick={showAll ? () => {
                        setShowAll(false);
                        setFirstItemExpanded(false);
                    } : handleShowAll}
                >
                    {showAll ? <>Vis mindre tekstinnhald</> : <>Vis alt tekstinnhald (+{textItems.length - 1})</>}
                </button>
            )}
        </>
    );
}


const SourcesTab = ({ datasets, isFiltered, isInitGroup }: { datasets: Record<string, any[]>, isFiltered: boolean, isInitGroup: boolean }) => {
    const [showAll, setShowAll] = useState(false)
    const datasetKeys = useMemo(() => Object.keys(datasets).filter(ds => datasets[ds] && datasets[ds].length > 0), [datasets])
    const { sosiVocab, coordinateVocab, mapFunctionRef } = useContext(GlobalContext)

    // If not filtered: show 2 if more than 3, otherwise show all
    // If filtered: show 4 if more than 5, otherwise show all
    const hasMore = isFiltered ? datasetKeys.length > 5 : datasetKeys.length > 3
    const visibleCount = isFiltered ? (hasMore ? 4 : datasetKeys.length) : (hasMore ? 2 : datasetKeys.length)
    const visibleDatasets = showAll ? datasetKeys : datasetKeys.slice(0, visibleCount)
    const searchParams = useSearchParams()
    const activePoint = searchParams.get('activePoint')

    return (
        <ul className="flex flex-col w-full gap-4 pt-4">
            {visibleDatasets.map((ds) => {
                const items = datasets[ds] || []
                if (items.length === 0) return null

                return (
                    <li key={`sources-ds-${ds}`} className="flex flex-col w-full gap-1">
                        {searchParams.getAll('dataset').length != 1 && <div className="flex items-center gap-2 text-neutral-800 uppercase traciking-wider">
                            {datasetTitles[ds] || ds}
                            <ClickableIcon
                                href={`/info/datasets/${ds}`}
                                className="flex items-center"
                                label="Om datasettet"
                            >
                                <PiInfoFill className="text-primary-700 text-sm align-middle" aria-hidden="true" />
                            </ClickableIcon>
                        </div>}
                        <ul className="flex flex-col w-full gap-1">
                            {items.map((s: any) => {
                                const additionalLabels = Array.from(
                                    new Set([
                                        ...(s.altLabels ?? []),
                                        ...(s.attestations?.map((a: any) => a.label) ?? [])
                                    ].filter((l: any) => l && l !== s.label))
                                ).join(", ")

                                // Collect and format sosi types
                                const sosiTypesRaw = s.sosi
                                    ? (Array.isArray(s.sosi) ? s.sosi : [s.sosi]).filter((sosi: string) => sosi)
                                    : []
                                const sosiTypes = sosiTypesRaw.map((type: string) => sosiVocab?.[type]?.label || type)
                                const sosiTypesDisplay = sosiTypes.length > 0 ? ` (${sosiTypes.join(', ')})` : ''

                                const lat = s.location?.coordinates?.[1];
                                const lng = s.location?.coordinates?.[0];
                                const isActive = activePoint && lat && lng && activePoint === `${lat},${lng}`;
                                const coordinateTypeLabel = s.coordinateType && coordinateVocab?.[s.coordinateType]?.label;

                                return (
                                    <li key={s.uuid} className="py-1 flex items-center gap-2">
                                        {isInitGroup && !activePoint && s.location?.coordinates?.length === 2 && (
                                            <ClickableIcon
                                                label="Koordinatdetaljar"
                                                onClick={() => {
                                                    mapFunctionRef.current?.flyTo([lat, lng], 15, { duration: 0.25, maxZoom: 18, padding: [50, 50] });
                                                }}
                                                add={{
                                                    activePoint: `${lat},${lng}`,

                                                }}
                                                className={`flex-shrink-0 p-1 rounded-full ${isActive ? 'text-accent-700 outline outline-1 outline-accent-700 bg-accent-50' : 'text-neutral-700 hover:bg-neutral-100'}`}
                                            >
                                                <PiMapPinFill className="text-base text-neutral-600" />
                                            </ClickableIcon>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div>
                                                <Link className="no-underline hover:underline" href={"/uuid/" + s.uuid}><strong>{s.label}</strong></Link>
                                                {sosiTypesDisplay && <span className="text-neutral-900">{sosiTypesDisplay}</span>}
                                                {additionalLabels && <span className="text-neutral-900"> – {additionalLabels}</span>}
                                                {resultRenderers[ds]?.links?.(s) || defaultResultRenderer?.links?.(s)}
                                            </div>
                                            {isInitGroup && activePoint && lat && lng && (
                                                <div className="bg-neutral-50 border border-neutral-200 rounded-md px-2 py-1 mt-0.5 w-full">{coordinateTypeLabel || "Opphavleg koordinat i " + datasetTitles[ds]} </div>
                                            )}
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    </li>
                )
            })}
            {hasMore && (
                <li className="mt-1">
                    <button
                        type="button"
                        className="text-lg text-neutral-900 flex items-center gap-1"
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? 'Færre datasett' : `Fleire datasett (+${datasetKeys.length - visibleCount})`}
                    </button>
                </li>
            )}
        </ul>
    )
}

const NamesSection = ({ datasets }: { datasets: Record<string, any[]> }) => {
    const [showAll, setShowAll] = useState(false)
    const searchParams = useSearchParams()
    const activeYear = searchParams.get('activeYear')
    const activeName = searchParams.get('activeName')

    const { yearsOrdered, namesByYear, namesWithoutYear, nameCounts, itemsByDataset } = useMemo(() => {
        // Helper functions to check if source matches filters
        const matchesYear = (source: any) => {
            if (!activeYear) return true
            if (String(source?.year) === activeYear) return true
            if (Array.isArray(source?.attestations)) {
                if (source.attestations.some((a: any) => String(a?.year) === activeYear)) return true
            }
            return false
        }

        const matchesName = (source: any) => {
            if (!activeName) return true
            if (source?.label && String(source.label) === activeName) return true
            if (Array.isArray(source?.altLabels)) {
                if (source.altLabels.some((al: any) => String(typeof al === 'string' ? al : al?.label) === activeName)) return true
            }
            if (Array.isArray(source?.attestations)) {
                if (source.attestations.some((a: any) => String(a?.label) === activeName)) return true
            }
            return false
        }

        // 1) Empty structures
        const nameToYears: Record<string, Set<string>> = {}
        const nameCounts: Record<string, number> = {}
        const itemsByDataset: Record<string, any[]> = {}

        // 2) Build lookup from labels/altLabels (using source.year) and attestations (using att.year)
        const pushNameYear = (name: string | undefined, year: any, source: any) => {
            if (!name) return
            // Only include if source matches all active filters
            if (!matchesYear(source)) return
            if (!matchesName(source)) return
            const y = year != null ? String(year) : null
            if (!y) return
            nameToYears[name] = nameToYears[name] || new Set<string>()
            nameToYears[name].add(y)
            nameCounts[name] = (nameCounts[name] || 0) + 1
        }

        Object.entries(datasets).forEach(([ds, sources]) => {
            itemsByDataset[ds] = itemsByDataset[ds] || []
            sources.forEach((source: any) => {
                itemsByDataset[ds].push(source)
                // Labels and altLabels only when source.year exists
                if (source?.year) {
                    pushNameYear(source.label, source.year, source)
                    if (Array.isArray(source?.altLabels)) {
                        source.altLabels.forEach((alt: any) => pushNameYear(typeof alt === 'string' ? alt : alt?.label, source.year, source))
                    }
                }
                // Attestations: use their own year
                if (Array.isArray(source?.attestations)) {
                    source.attestations.forEach((att: any) => pushNameYear(att?.label, att?.year, source))
                }
            })
        })

        // 3) Compute earliest occurrence per name and bucket names by that year
        const namesByYear: Record<string, string[]> = {}
        const namesWithoutYear: string[] = []
        Object.entries(nameToYears).forEach(([name, yearsSet]) => {
            const years = Array.from(yearsSet)
            if (years.length === 0) {
                namesWithoutYear.push(name)
                return
            }
            const numeric = years
                .map((y) => ({ raw: y, num: Number(y) }))
                .filter((y) => !Number.isNaN(y.num))
                .sort((a, b) => a.num - b.num)
            const earliest = numeric.length ? numeric[0].raw : years.sort()[0]
            namesByYear[earliest] = namesByYear[earliest] || []
            namesByYear[earliest].push(name)
        })
        Object.keys(namesByYear).forEach((y) => namesByYear[y].sort())
        const yearsOrdered = Object.keys(namesByYear)
            .map((y) => Number.isNaN(Number(y)) ? y : Number(y))
            .sort((a: any, b: any) => (a > b ? 1 : a < b ? -1 : 0))
            .map(String)

        return { yearsOrdered, namesByYear, namesWithoutYear, nameCounts, itemsByDataset }
    }, [datasets, activeYear, activeName])

    // Rebuild filtered data based on active filters
    const { filteredYearsOrdered, filteredNamesByYear, filteredNamesWithoutYear } = useMemo(() => {
        if (!activeYear && !activeName) {
            // No filter: show everything
            return {
                filteredYearsOrdered: yearsOrdered,
                filteredNamesByYear: namesByYear,
                filteredNamesWithoutYear: namesWithoutYear
            }
        }

        // Helper to check if source matches current filters
        const sourceMatchesFilter = (source: any) => {
            if (activeYear) {
                if (String(source?.year) === activeYear) return true
                if (Array.isArray(source?.attestations)) {
                    if (source.attestations.some((a: any) => String(a?.year) === activeYear)) return true
                }
            }
            if (activeName) {
                if (source?.label && String(source.label) === activeName) return true
                if (Array.isArray(source?.altLabels)) {
                    if (source.altLabels.some((al: any) => String(typeof al === 'string' ? al : al?.label) === activeName)) return true
                }
                if (Array.isArray(source?.attestations)) {
                    if (source.attestations.some((a: any) => String(a?.label) === activeName)) return true
                }
            }
            return false
        }

        // Build filtered name-to-years mapping
        const filteredNameToYears: Record<string, Set<string>> = {}
        const filteredNameCounts: Record<string, number> = {}

        Object.entries(datasets).forEach(([_ds, sources]) => {
            sources.forEach((source: any) => {
                if (!sourceMatchesFilter(source)) return

                // Process labels and altLabels with source.year
                if (source?.year) {
                    const pushName = (name: string | undefined) => {
                        if (!name) return
                        const y = String(source.year)
                        filteredNameToYears[name] = filteredNameToYears[name] || new Set<string>()
                        filteredNameToYears[name].add(y)
                        filteredNameCounts[name] = (filteredNameCounts[name] || 0) + 1
                    }
                    pushName(source.label)
                    if (Array.isArray(source?.altLabels)) {
                        source.altLabels.forEach((alt: any) => pushName(typeof alt === 'string' ? alt : alt?.label))
                    }
                }

                // Process attestations with their own year
                if (Array.isArray(source?.attestations)) {
                    source.attestations.forEach((att: any) => {
                        if (!att?.label) return
                        const y = att?.year != null ? String(att.year) : null
                        if (!y) return
                        filteredNameToYears[att.label] = filteredNameToYears[att.label] || new Set<string>()
                        filteredNameToYears[att.label].add(y)
                        filteredNameCounts[att.label] = (filteredNameCounts[att.label] || 0) + 1
                    })
                }
            })
        })

        // Build filtered namesByYear
        const filteredNamesByYear: Record<string, string[]> = {}
        const filteredNamesWithoutYear: string[] = []

        Object.entries(filteredNameToYears).forEach(([name, yearsSet]) => {
            const years = Array.from(yearsSet)
            if (years.length === 0) {
                filteredNamesWithoutYear.push(name)
                return
            }

            // If this is the active name filter, show it in ALL years where it appears
            if (activeName && name === activeName) {
                years.forEach((year) => {
                    filteredNamesByYear[year] = filteredNamesByYear[year] || []
                    if (!filteredNamesByYear[year].includes(name)) {
                        filteredNamesByYear[year].push(name)
                    }
                })
            } else {
                // For other names, group by earliest year (normal behavior)
                const numeric = years
                    .map((y) => ({ raw: y, num: Number(y) }))
                    .filter((y) => !Number.isNaN(y.num))
                    .sort((a, b) => a.num - b.num)
                const earliest = numeric.length ? numeric[0].raw : years.sort()[0]
                filteredNamesByYear[earliest] = filteredNamesByYear[earliest] || []
                filteredNamesByYear[earliest].push(name)
            }
        })

        Object.keys(filteredNamesByYear).forEach((y) => filteredNamesByYear[y].sort())
        const filteredYearsOrdered = Object.keys(filteredNamesByYear)
            .map((y) => Number.isNaN(Number(y)) ? y : Number(y))
            .sort((a: any, b: any) => (a > b ? 1 : a < b ? -1 : 0))
            .map(String)

        return {
            filteredYearsOrdered,
            filteredNamesByYear,
            filteredNamesWithoutYear
        }
    }, [datasets, activeYear, activeName, yearsOrdered, namesByYear, namesWithoutYear])

    // Build filtered items list
    const filteredItems = useMemo(() => {
        return [
            ...filteredYearsOrdered.map(y => ({ type: 'year' as const, year: y, names: filteredNamesByYear[y] || [] })),
            ...filteredNamesWithoutYear.map(n => ({ type: 'noYear' as const, name: n, count: nameCounts[n] || 0 }))
        ]
    }, [filteredYearsOrdered, filteredNamesByYear, filteredNamesWithoutYear, nameCounts])

    const hasActiveFilter = !!(activeYear || activeName)

    const allItems = [...yearsOrdered.map(y => ({ type: 'year' as const, year: y, names: namesByYear[y] || [] })), ...namesWithoutYear.map(n => ({ type: 'noYear' as const, name: n, count: nameCounts[n] || 0 }))]
    const hasMore = !hasActiveFilter && filteredItems.length > 3
    const allYearItems = filteredItems.filter(item => item.type === 'year')
    const allNoYearItems = filteredItems.filter(item => item.type === 'noYear')

    // When collapsed and hasMore: show first year item and last year item (collapse in the middle)
    // Otherwise: show all items
    const visibleYearItems = showAll || hasActiveFilter ? allYearItems : (
        hasMore && allYearItems.length > 1
            ? [allYearItems[0], allYearItems[allYearItems.length - 1]]
            : allYearItems.slice(0, Math.min(3, allYearItems.length))
    )
    // Items without year are always shown (they're handled separately in the UI)
    const visibleNoYearItems = allNoYearItems
    const visibleItems = [...visibleYearItems, ...visibleNoYearItems]
    const isCollapsed = hasMore && !showAll && !hasActiveFilter && allYearItems.length > 1
    const hiddenYearItemsCount = allYearItems.length - visibleYearItems.length

    if (allItems.length === 0) return null

    return (
        <div className="flex flex-col gap-3 py-2">

            <div role="group" aria-label="Filtrer på år og namneformer">
                {/* Vertical Timeline */}
                {visibleYearItems.length > 0 && (
                    <ul className="relative !mx-2 !px-0 p-2" role="list">
                        {visibleYearItems.map((item, index) => {
                            const isYearSelected = activeYear === item.year
                            const isLast = index === visibleYearItems.length - 1
                            const isFirst = index === 0
                            const showCollapseIndicator = isCollapsed && isFirst && visibleYearItems.length > 1

                            return (
                                <Fragment key={item.year}>
                                    <li className="flex items-center !pb-4 !pt-0 relative">
                                        {/* Timeline line segment */}
                                        <div
                                            className={`bg-primary-300 absolute w-1 left-0 ${showCollapseIndicator && isFirst
                                                    ? 'top-1 bottom-0'
                                                    : showCollapseIndicator && isLast
                                                        ? 'top-0 h-2'
                                                        : isLast
                                                            ? 'top-1 h-2'
                                                            : 'top-1 h-full'
                                                } ${index === 0 ? 'mt-2' : ''}`}
                                            aria-hidden="true"
                                        />

                                        {/* Timeline marker dot */}
                                        <div
                                            className={`w-4 h-4 rounded-full absolute -left-1.5 top-2 transition-colors ${isYearSelected
                                                    ? 'bg-accent-800'
                                                    : 'bg-primary-500'
                                                }`}
                                            aria-hidden="true"
                                        />

                                        {/* Year and name variants on same line */}
                                        <div className="ml-6 flex items-center gap-2 flex-wrap">
                                            {/* Year button */}
                                            <Clickable
                                                replace
                                                add={isYearSelected ? undefined : { activeYear: item.year }}
                                                remove={isYearSelected ? ['activeYear'] : ['activeName']}
                                                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors min-w-[2.5rem] whitespace-nowrap ${isYearSelected
                                                        ? 'bg-accent-800 text-white'
                                                        : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                                                    }`}
                                            >
                                                {item.year}
                                            </Clickable>

                                            {/* Name variants for this year - on same line */}
                                            {item.names.length > 0 && (
                                                <>
                                                    {item.names.map((nameKey) => {
                                                        const isNameSelected = activeName === nameKey

                                                        return (
                                                            <Clickable
                                                                key={nameKey}
                                                                replace
                                                                add={isNameSelected ? undefined : { activeName: nameKey }}
                                                                remove={isNameSelected ? ['activeName'] : ['activeYear']}
                                                                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors min-w-[2.5rem] whitespace-nowrap ${isNameSelected
                                                                        ? 'bg-accent-800 text-white'
                                                                        : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                                                                    }`}
                                                            >
                                                                {nameKey}
                                                            </Clickable>
                                                        )
                                                    })}
                                                </>
                                            )}
                                        </div>
                                    </li>
                                    {/* Collapse indicator in the middle - transit app style */}
                                    {showCollapseIndicator && (
                                        <li className="flex items-center !pb-4 !pt-0 relative" key={`${item.year}-collapse-indicator`}>
                                            {/* Dashed timeline line segment - extends into padding to connect seamlessly */}
                                            <div
                                                className="absolute left-0 -top-4 -bottom-4 w-1 [background:repeating-linear-gradient(to_bottom,theme(colors.primary.300)_0px,theme(colors.primary.300)_4px,transparent_4px,transparent_8px)] [background-size:4px_8px]"
                                                aria-hidden="true"
                                            />

                                            {/* Collapse button */}
                                            <div className="ml-6 flex items-center">
                                                <button
                                                    type="button"
                                                    className="text-neutral-700 hover:text-accent-800 transition-colors text-sm py-1"
                                                    onClick={() => setShowAll(true)}
                                                    aria-expanded={false}
                                                >
                                                    Vis fleire ({hiddenYearItemsCount})
                                                </button>
                                            </div>
                                        </li>
                                    )}
                                </Fragment>
                            )
                        })}
                        {/* Show fewer button at end when expanded */}
                        {hasMore && !hasActiveFilter && showAll && (
                            <li className="flex items-center !pt-2" key="show-fewer">
                                <div className="ml-6 flex items-center">
                                    <button
                                        type="button"
                                        className="text-neutral-700 hover:text-accent-800 transition-colors text-sm py-1"
                                        onClick={() => setShowAll(false)}
                                        aria-expanded={true}
                                    >
                                        Vis færre
                                    </button>
                                </div>
                            </li>
                        )}
                    </ul>
                )}

                {/* Names without year */}
                {visibleItems.filter(item => item.type === 'noYear').length > 0 && (
                    <div className="mt-4 pt-4 border-t border-neutral-200">
                        <div className="text-sm font-medium text-neutral-700 mb-2">Namneformer utan år</div>
                        <div className="flex flex-wrap gap-2">
                            {visibleItems
                                .filter(item => item.type === 'noYear')
                                .map((item) => {
                                    const isNameSelected = activeName === item.name

                                    return (
                                        <Clickable
                                            key={item.name}
                                            replace
                                            add={isNameSelected ? undefined : { activeName: item.name }}
                                            remove={isNameSelected ? ['activeName'] : ['activeYear']}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors min-w-[2.5rem] whitespace-nowrap ${isNameSelected
                                                    ? 'bg-accent-800 text-white'
                                                    : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                                                }`}
                                        >
                                            <span>{item.name}</span>
                                            <span className="text-sm opacity-75 ml-1">({item.count})</span>
                                        </Clickable>
                                    )
                                })}
                        </div>
                    </div>
                )}
            </div>

            {/* Active filter display */}
            {hasActiveFilter && (
                <div className="flex items-center gap-3 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                    <strong className="text-neutral-900 text-base">
                        {activeYear ? `År: ${activeYear}` : activeName ? `Namneform: ${activeName}` : ''}
                    </strong>
                    <ClickableIcon
                        label="Fjern kjeldeavgrensing"
                        replace
                        remove={['activeYear', 'activeName']}
                        className="ml-auto text-accent-800 hover:text-accent-900 underline underline-offset-2 font-medium transition-colors"
                    >
                        <PiX className="text-neutral-800" />
                    </ClickableIcon>
                </div>
            )}

        </div>
    )
}







// Helper functions for filtering sources
const matchesActiveYear = (s: any, activeYear: string | null) => {
    if (!activeYear) return true
    if (String(s?.year) === activeYear) return true
    if (Array.isArray(s?.attestations)) {
        if (s.attestations.some((a: any) => String(a?.year) === activeYear)) return true
    }
    return false
}

const matchesActiveName = (s: any, activeName: string | null) => {
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

const matchesActivePoint = (s: any, activePoint: string | null) => {
    if (!activePoint) return true
    const lat = s.location?.coordinates?.[1]
    const lng = s.location?.coordinates?.[0]
    if (!lat || !lng) return false
    return activePoint === `${lat},${lng}`
}

// Component that filters datasets and renders SourcesTab
const FilteredSourcesTab = ({
    datasets,
    activeYear,
    activeName,
    isInitGroup
}: {
    datasets: Record<string, any[]>,
    activeYear: string | null,
    activeName: string | null,
    isInitGroup: boolean
}) => {
    const searchParams = useSearchParams()
    const activePoint = searchParams.get('activePoint')

    const filtered = useMemo(() => {
        const result: Record<string, any[]> = {}
        Object.keys(datasets).forEach((ds) => {
            result[ds] = (datasets[ds] || []).filter((s: any) =>
                // Only filter by activeYear, activeName, and activePoint if this is the init group
                (isInitGroup ? matchesActiveYear(s, activeYear) : true) &&
                (isInitGroup ? matchesActiveName(s, activeName) : true) &&
                (isInitGroup ? matchesActivePoint(s, activePoint) : true)
            )
        })
        return result
    }, [datasets, activeYear, activeName, activePoint, isInitGroup])

    const isFiltered = !!(activeYear || activeName || (isInitGroup && activePoint))

    return <SourcesTab datasets={filtered} isFiltered={isFiltered} isInitGroup={isInitGroup} />
}


export default function GroupInfo({ id, overrideGroupCode }: { id: string, overrideGroupCode?: string }) {
    const { groupData, groupLoading } = useGroupData(overrideGroupCode)
    const prefTab = useSessionStore(state => state.prefTab)
    const setPrefTab = useSessionStore(state => state.setPrefTab)
    const openTabs = useSessionStore(state => state.openTabs)
    const setOpenTabs = useSessionStore(state => state.setOpenTabs)
    const searchParams = useSearchParams()
    const searchDatasets = searchParams.getAll('dataset')
    const { mapFunctionRef, scrollableContentRef } = useContext(GlobalContext)
    const { initValue } = useGroup()
    const activePoint = searchParams.get('activePoint')

    // Read activeYear and activeName from URL params
    const activeYear = searchParams.get('activeYear')
    const activeName = searchParams.get('activeName')

    // Scroll to top when init group changes (when clicking "vel" button)
    useEffect(() => {
        if (groupData?.group?.id && initValue === groupData.group.id && scrollableContentRef.current) {
            // Use requestAnimationFrame to ensure scroll happens after render
            requestAnimationFrame(() => {
                scrollableContentRef.current?.scrollTo({
                    top: 0,
                    behavior: 'auto'
                });
            });
        }
    }, [initValue, groupData?.group?.id, scrollableContentRef]);

    const { iiifItems, textItems, audioItems, datasets, locations, uniqueCoordinates } = useMemo(() => {
        const iiifItems: any[] = []
        const textItems: any[] = []
        const audioItems: any[] = []
        const locations: any[] = []
        const seenEnhetsid = new Set<string>()
        const datasets: Record<string, any[]> = {}
        const coordSet = new Set<string>()

        groupData?.sources?.sort((a: any, b: any) => {
            const aInSearch = searchDatasets.includes(a.dataset);
            const bInSearch = searchDatasets.includes(b.dataset);

            if (aInSearch && !bInSearch) return -1;
            if (!aInSearch && bInSearch) return 1;

            // Both are in the same category, sort by boost (descending)
            const boostA = typeof a.boost === "number" ? a.boost : -Infinity;
            const boostB = typeof b.boost === "number" ? b.boost : -Infinity;
            if (boostA !== boostB) return boostB - boostA;

            // If boost is equal, fall back to original (optional: keep stable)
            return 0;
        })


        const seenTextIds = new Set<string>()




        groupData?.sources?.forEach((source: any) => {
            if (!source.textId || !seenTextIds.has(source.textId)) {

                if (source.content?.html) {

                    textItems.push(source)
                    if (source.textId) seenTextIds.add(source.textId)
                }
                else if (source.content?.text) {
                    textItems.push(source)
                    if (source.textId) seenTextIds.add(source.textId)
                }
            }
            if (source.iiif) {
                iiifItems.push(source)

            }
            if (source.recordings) {
                audioItems.push(source)
            }
            if (source.location) {
                locations.push(source)
                // Collect unique coordinates
                const lat = source.location?.coordinates?.[1]
                const lng = source.location?.coordinates?.[0]
                if (lat != null && lng != null) {
                    coordSet.add(`${lat},${lng}`)
                }
            }
            datasets[source.dataset] = datasets[source.dataset] || []
            datasets[source.dataset].push(source)
        })


        return { iiifItems, textItems, audioItems, datasets, locations, uniqueCoordinates: Array.from(coordSet) }
    }, [groupData, searchDatasets])

    // Find current coordinate index
    const currentCoordIndex = useMemo(() => {
        if (!activePoint) return -1
        return uniqueCoordinates.indexOf(activePoint)
    }, [activePoint, uniqueCoordinates])

    // Helper function to push name-year pairs
    const pushNameYear = (nameToYears: Record<string, Set<string>>, name: string | undefined, year: any) => {
        if (!name) return
        const y = year != null ? String(year) : null
        if (!y) return
        nameToYears[name] = nameToYears[name] || new Set<string>()
        nameToYears[name].add(y)
    }

    const showNamesTab = useMemo(() => {
        // Replicate NamesTab's filter determinism: timeline or names without year
        const nameToYears: Record<string, Set<string>> = {}
        Object.values(datasets).forEach((sources: any[]) => {
            sources.forEach((source: any) => {
                if (source?.year) {
                    pushNameYear(nameToYears, source.label, source.year)
                    if (Array.isArray(source?.altLabels)) {
                        source.altLabels.forEach((alt: any) => pushNameYear(nameToYears, typeof alt === 'string' ? alt : alt?.label, source.year))
                    }
                }
                if (Array.isArray(source?.attestations)) {
                    source.attestations.forEach((att: any) => pushNameYear(nameToYears, att?.label, att?.year))
                }
            })
        })
        const namesByYear: Record<string, string[]> = {}
        const namesWithoutYear: string[] = []
        Object.entries(nameToYears).forEach(([name, yearsSet]) => {
            const years = Array.from(yearsSet)
            if (years.length === 0) {
                namesWithoutYear.push(name)
                return
            }
            const numeric = years
                .map((y) => ({ raw: y, num: Number(y) }))
                .filter((y) => !Number.isNaN(y.num))
                .sort((a, b) => a.num - b.num)
            const earliest = numeric.length ? numeric[0].raw : years.sort()[0]
            namesByYear[earliest] = namesByYear[earliest] || []
            namesByYear[earliest].push(name)
        })
        const yearsOrdered = Object.keys(namesByYear)
        return (yearsOrdered.length > 1) || (namesWithoutYear.length > 0)
    }, [datasets])

    // Check if label filter should be shown
    const shouldShowLabelFilter = useMemo(() => {
        // Count total sources across all datasets
        const totalSources = Object.values(datasets).reduce((sum, sources) => sum + sources.length, 0)

        // If there's only one result, don't show the filter
        if (totalSources <= 1) {
            return false
        }

        // Check if all sources match all active filters
        const hasActiveFilters = !!(activeYear || activeName)
        if (!hasActiveFilters) {
            return showNamesTab // Show if there are multiple names/years to filter by
        }

        // Count how many sources match the active filters
        let matchingCount = 0
        Object.values(datasets).forEach((sources: any[]) => {
            sources.forEach((source: any) => {
                if (matchesActiveYear(source, activeYear) && matchesActiveName(source, activeName)) {
                    matchingCount++
                }
            })
        })

        // If all sources match all filters, don't show the filter
        if (matchingCount === totalSources) {
            return false
        }

        return showNamesTab
    }, [datasets, activeYear, activeName, showNamesTab])

    useEffect(() => {
        if (!groupData?.group) {
            console.log("GROUP ISSUE", groupData);
            return;
        }
        if (groupData?.group.id) {
            const groupId = groupData.group.id;
            const currentTab = openTabs[groupId];

            // 1. Check if there's already a value stored at the id in openTabs
            if (currentTab) {
                // Verify the tab is still valid for this group
                if (currentTab === 'sources') {
                    return; // Keep the existing tab
                }
                if (currentTab === 'names' && showNamesTab) {
                    return; // Keep the existing tab
                }
                if (currentTab === 'locations' && locations.length > 0) {
                    return; // Keep the existing tab
                }
                // If current tab is names but not applicable, fall through to default below
            }

            // 2. Use prefTab if the group has the required content
            if (prefTab === 'sources') {
                setOpenTabs(groupId, 'sources');
                return;
            }
            if (prefTab === 'names' && showNamesTab) {
                setOpenTabs(groupId, 'names');
                return;
            }
            if (prefTab === 'locations' && locations.length > 0) {
                setOpenTabs(groupId, 'locations');
                return;
            }

            // 3. Default to sources
            setOpenTabs(groupId, 'sources');

        }
    }, [groupData, textItems.length, locations.length, openTabs, prefTab, setOpenTabs, showNamesTab])


    if (groupLoading) return (
        <div className="flex justify-center items-center w-full py-8">
            <Spinner status="Laster" className="animate-spin rounded-full h-8 w-8"></Spinner>
        </div>
    )

    const isGrunnord = Object.keys(datasets).some((ds: any) => ds.includes('_g'))
    if (!groupData?.group?.id) {
        console.log("Group ID not found")
        const props = {
            message: `Group ID not found: ${JSON.stringify(groupData)}`
        }

        fetch('/api/error', {
            method: 'POST',
            body: JSON.stringify(props)
        })
        return <div className="p-2">Kunne ikkje lasta inn gruppe</div>
    }


    return (
        <div id={id} className="w-full flex flex-col gap-2 pb-8 relative">

            {
                audioItems?.map((audioItem) => (
                    <div key={audioItem.uuid + 'audio'}>
                        {audioItem.recordings.map((recording: any) => (
                            <div key={"audio-" + recording.uuid} className="flex items-center">
                                <audio
                                    controls
                                    src={`https://iiif.spraksamlingane.no/iiif/audio/hord/${recording.file}`}
                                    className="h-10 rounded-md
                                    [&::-webkit-media-controls-enclosure]:bg-transparent 
                                    [&::-webkit-media-controls-current-time-display]:text-neutral-800 
                                    [&::-webkit-media-controls-time-remaining-display]:text-neutral-800"
                                />
                                <Link href={`/iiif/${recording.manifest}`} className="ml-1 p-2 rounded-full aspect-square">
                                    <PiArchive className="text-md text-neutral-800" aria-hidden="true" />
                                </Link>
                            </div>
                        ))}
                    </div>
                ))
            }
            {iiifItems?.length > 0 && !activePoint && <>
                <Carousel items={iiifItems} />
            </>
            }
            {textItems.length > 0 && !activePoint && <TextTab textItems={textItems} />}

            <div className="w-full pb-4 flex flex-col">
                {/* Names section (includes timeline) - only show in init group when no activePoint filter is active */}
                {shouldShowLabelFilter && initValue === groupData.group.id && !searchParams.get('activePoint') &&
                    <div className="px-3 pt-2">
                        <NamesSection datasets={datasets} />
                    </div>
                }

                {/* Active point filter display - only in init group */}
                {searchParams.get('activePoint') && initValue === groupData.group.id && (
                    <div className="px-3 pt-2">
                        <div className="flex items-center gap-2 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                            <PiMapPinFill className="text-accent-800 flex-shrink-0" aria-hidden="true" />
                            <span className="text-neutral-900 text-base">
                                {searchParams.get('activePoint')?.split(',').map((coord: string, index: number) => {
                                    const value = parseFloat(coord);
                                    return `${index === 0 ? 'N' : 'Ø'} ${value.toFixed(4)}°`;
                                }).join(', ')}
                            </span>
                            {/* Navigation buttons - only show if there are multiple coordinates */}
                            {uniqueCoordinates.length > 1 ? (
                                <div className="flex items-center h-8 bg-white rounded-md border border-neutral-200 ml-2">
                                    <ClickableIcon
                                        label="Forrige koordinat"
                                        className="btn btn-outline btn-compact rounded-r-none h-8"
                                        add={{ activePoint: uniqueCoordinates[(currentCoordIndex - 1 + uniqueCoordinates.length) % uniqueCoordinates.length] }}
                                        onClick={(e) => {
                                            const prevIndex = (currentCoordIndex - 1 + uniqueCoordinates.length) % uniqueCoordinates.length
                                            const prevCoord = uniqueCoordinates[prevIndex]
                                            const [lat, lng] = prevCoord.split(',').map(parseFloat)
                                            // Use setTimeout to ensure URL update happens first
                                            setTimeout(() => {
                                                mapFunctionRef.current?.flyTo([lat, lng], 15, { duration: 0.25, maxZoom: 18, padding: [50, 50] })
                                            }, 0)
                                        }}
                                    >
                                        <PiCaretLeftBold className="text-primary-700" aria-hidden="true" />
                                    </ClickableIcon>
                                    <span className="text-neutral-800 border-y border-neutral-200 h-8 flex items-center min-w-12 text-center px-3 text-sm">
                                        {currentCoordIndex + 1}/{uniqueCoordinates.length}
                                    </span>
                                    <ClickableIcon
                                        label="Neste koordinat"
                                        className="btn btn-outline btn-compact rounded-l-none h-8"
                                        add={{ activePoint: uniqueCoordinates[(currentCoordIndex + 1) % uniqueCoordinates.length] }}
                                        onClick={(e) => {
                                            const nextIndex = (currentCoordIndex + 1) % uniqueCoordinates.length
                                            const nextCoord = uniqueCoordinates[nextIndex]
                                            const [lat, lng] = nextCoord.split(',').map(parseFloat)
                                            // Use setTimeout to ensure URL update happens first
                                            setTimeout(() => {
                                                mapFunctionRef.current?.flyTo([lat, lng], 15, { duration: 0.25, maxZoom: 18, padding: [50, 50] })
                                            }, 0)
                                        }}
                                    >
                                        <PiCaretRightBold className="text-primary-700" aria-hidden="true" />
                                    </ClickableIcon>
                                </div>
                            ) : (
                                <em className="text-neutral-800 ml-2">Einaste koordinat</em>
                            )}
                            <ClickableIcon
                                label="Fjern kjeldeavgrensing"
                                remove={['activePoint']}
                                className="ml-auto text-accent-800 hover:text-accent-900"
                            >
                                <PiX className="text-neutral-800" />
                            </ClickableIcon>
                        </div>
                    </div>
                )}

                {/* Sources always shown */}
                <div className="px-3">
                    <FilteredSourcesTab
                        datasets={datasets}
                        activeYear={activeYear}
                        activeName={activeName}
                        isInitGroup={initValue === groupData.group.id}
                    />
                </div>
            </div>


            {locations.length > 0 && locations[0]?.location?.coordinates && initValue !== groupData.group.id && (
                <div className="absolute bottom-0 right-0 p-3">
                    <ClickableIcon
                        label="Vel namnegruppe"
                        onClick={() => {
                            // Fit bounds to group sources
                            fitBoundsToGroupSources(mapFunctionRef.current, groupData);
                        }}
                        remove={['group', 'activePoint', 'activeYear', 'activeName']}
                        add={{
                            // When pinning a group ("vel"), treat it as a fresh init selection:
                            // reset results to 1 so previous expansions are not preserved.
                            init: stringToBase64Url(groupData.group.id),
                            maxResults: '1'
                        }}
                        className="btn btn-neutral rounded-full lg:rounded-md aspect-square p-2 flex items-center justify-center gap-2 font-semibold"
                    >
                        <PiPushPinFill aria-hidden="true" className="text-2xl" />
                    </ClickableIcon>
                </div>
            )}

        </div>
    );
}