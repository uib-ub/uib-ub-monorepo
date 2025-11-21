import useGroupData from "@/state/hooks/group-data";
import Carousel from "../../nav/results/carousel";
import { useEffect, useMemo, useState, useContext, type ReactNode } from "react";
import { datasetTitles } from "@/config/metadata-config";
import { formatHtml } from "@/lib/text-utils";
import { defaultResultRenderer, resultRenderers } from "@/config/result-renderers";
import { PiMinusBold, PiMapPin, PiPlusBold, PiQuestionFill, PiMapPinFill, PiInfoFill, PiArchive, PiInfo, PiPushPinBold, PiPushPinFill, PiMagnifyingGlass, PiPushPin, PiX } from "react-icons/pi";
import WarningMessage from "./warning-message";
import { useSessionStore } from "@/state/zustand/session-store";
import Spinner from "@/components/svg/Spinner";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import AudioExplorer from "@/components/doc/audio-explorer";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import Clickable from "@/components/ui/clickable/clickable";
import { GlobalContext } from "@/state/providers/global-provider";
import { stringToBase64Url } from "@/lib/param-utils";
import { useGroup } from "@/lib/param-hooks";
import { SearchParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";

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
                                message="Feil i digitaliseringa av Norske Gaardnavne gjer at nokon teikn ikkje stemmer med originalen, særleg i lydskrift. Sjå trykt utgåve på nb.no"
                                messageId="rygh-phonetic-warning"
                            />
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
                    className="mx-3 mb-0 flex items-center gap-1 text-neutral-900"
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


const SourcesTab = ({ datasets, isFiltered }: { datasets: Record<string, any[]>, isFiltered: boolean }) => {
    const [showAll, setShowAll] = useState(false)
    const datasetKeys = useMemo(() => Object.keys(datasets).filter(ds => datasets[ds] && datasets[ds].length > 0), [datasets])
    const { sosiVocab } = useContext(GlobalContext)

    // If not filtered: show 2 if more than 3, otherwise show all
    // If filtered: show 4 if more than 5, otherwise show all
    const hasMore = isFiltered ? datasetKeys.length > 5 : datasetKeys.length > 3
    const visibleCount = isFiltered ? (hasMore ? 4 : datasetKeys.length) : (hasMore ? 2 : datasetKeys.length)
    const visibleDatasets = showAll ? datasetKeys : datasetKeys.slice(0, visibleCount)
    const searchParams = useSearchParams()

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
                        <ul className="flex flex-col w-full -mx-2 gap-1">
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

                                return (
                                    <li key={s.uuid} className="px-2 py-1">
                                        <Link className="no-underline hover:underline" href={"/uuid/" + s.uuid}><strong>{s.label}</strong></Link>
                                        {sosiTypesDisplay && <span className="text-neutral-900">{sosiTypesDisplay}</span>}
                                        {additionalLabels && <span className="text-neutral-900"> – {additionalLabels}</span>}
                                        {resultRenderers[ds]?.links?.(s) || defaultResultRenderer?.links?.(s)}
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
                        {showAll ? 'Vis færre kjelder' : `Vis fleire kjelder (${datasetKeys.length - visibleCount})`}
                    </button>
                </li>
            )}
        </ul>
    )
}

const NamesSection = ({ datasets, activeYear, activeName, setActiveYear, setActiveName }: { datasets: Record<string, any[]>, activeYear: string | null, activeName: string | null, setActiveYear: (year: string | null) => void, setActiveName: (name: string | null) => void }) => {
    const [showAll, setShowAll] = useState(false)

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

	const allItems = [...yearsOrdered.map(y => ({ type: 'year' as const, year: y, names: namesByYear[y] || [] })), ...namesWithoutYear.map(n => ({ type: 'noYear' as const, name: n, count: nameCounts[n] || 0 }))]
	const hasMore = allItems.length > 3
	const visibleItems = showAll ? allItems : allItems.slice(0, hasMore ? 2 : Math.min(3, allItems.length))

	if (allItems.length === 0) return null

	return (
		<div className="flex flex-col gap-3 py-2">
			{itemsByDataset['rygh']?.find((s: any) => s.attestations && s.attestations.length > 0) && (
				<WarningMessage 
					message="Uregelmessigheiter i digitaliseringa av Norske Gaardnavne gjer at det kan førekomme ord i tidslinja som ikkje er namneformer. Sjå teksten dei er basert på under «Tolkingar»."
					messageId="rygh-namnform-warning"
				/>
			)}
			<ul className="relative mt-1 px-2">
				{visibleItems.map((item, idx) => {
					if (item.type === 'year') {
						const isLast = idx === visibleItems.length - 1
						const nameKeys = item.names
						return (
							<li key={item.year} className="flex items-center !pb-2 !pt-0 relative w-full">
								<div className={`bg-primary-300 absolute w-1 left-0 top-1 ${isLast ? 'h-4' : 'h-full'} ${idx === 0 ? 'mt-2' : ''}`}></div>
								<div className="w-3 h-3 rounded-full bg-primary-500 absolute -left-1 top-2"></div>
								<div className="ml-5 flex w-full items-start">
									<button
										type="button"
										onClick={() => {
											if (activeYear === item.year) {
												setActiveYear(null)
											} else {
												setActiveYear(item.year)
												setActiveName(null)
											}
										}}
										className={`mr-2 flex my-0 mt-0 font-medium px-2 py-1 rounded ${activeYear === item.year ? 'bg-accent-800 text-white' : 'bg-neutral-100 text-black'} underline-offset-4 hover:underline text-base`}
										aria-pressed={activeYear === item.year}
									>
										{item.year}
									</button>
									<ul className="flex flex-col gap-0.5">
										{nameKeys.map((nameKey) => (
											<li key={`${item.year}__${nameKey}`} className="flex w-full py-1 first:pt-0">
												<button
													type="button"
													onClick={() => {
														if (activeName === nameKey) {
															setActiveName(null)
														} else {
															setActiveName(nameKey)
															setActiveYear(null)
														}
													}}
													className={`text-left flex items-center gap-2 px-2 py-1 rounded ${activeName === nameKey ? 'bg-accent-800 text-white' : 'bg-neutral-100 text-black'} hover:underline underline-offset-4`}
													aria-pressed={activeName === nameKey}
												>
													<span className="font-medium">{nameKey}</span>
												</button>
											</li>
										))}
									</ul>
								</div>
							</li>
						)
					} else {
						return (
							<li key={`noYear__${item.name}`} className="flex flex-col w-full px-2">
								<div className="text-left flex items-center gap-3 py-2">
									<span className="font-medium">{item.name}</span>
									<span className="text-sm text-neutral-700">({item.count})</span>
								</div>
							</li>
						)
					}
				})}
			</ul>
			{hasMore && (
				<button
					type="button"
					className="text-neutral-900 flex items-center gap-1"
					onClick={() => setShowAll(!showAll)}
				>
					{showAll ? 'Vis færre namnefilter' : `Vis fleire namnefilter (${allItems.length - visibleItems.length})`}
				</button>
			)}
		</div>
	)
}


const TabButton = ({ groupData, tab, label }: { groupData: any, tab: 'sources' | 'names' | 'locations', label: string }) => {
    
    const setPrefTab = useSessionStore(state => state.setPrefTab)
    const setOpenTabs = useSessionStore(state => state.setOpenTabs)
    const openTabs = useSessionStore(state => state.openTabs)
    const isActive = openTabs[groupData.group.id] === tab
    const searchParams = useSearchParams()
    const router = useRouter();

    const handleClick = () => {
        setOpenTabs(groupData.group.id, tab);
        setPrefTab(tab);
        if (tab == 'locations') {
            const newParams = new URLSearchParams(searchParams);
            newParams.set('locations', 'on');
            router.replace(`?${newParams.toString()}`);
        }
        else if (searchParams.get('locations')) {
            const newParams = new URLSearchParams(searchParams);
            newParams.delete('locations');
            router.replace(`?${newParams.toString()}`);
        }

    }
    
    return (
        <button
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className="py-2 px-3"
            onClick={handleClick}
            id={`tab-${tab}`}
            aria-controls={`tabpanel-${tab}`}
            type="button"
        >
            <span className={`font-semibold border-b-2 transition-colors duration-150 uppercase tracking-wider
                            ${isActive
                    ? 'border-accent-800 text-accent-800'
                    : 'border-transparent text-neutral-800'
                }
                        `}>
                {label}
            </span>
        </button>
    )
}



const TabList = ({ children }: { children: ReactNode }) => {
    return (
        <div
            role="tablist"
            aria-label="Gruppefaner"
            className={`flex`}
        >
            {children}
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


// Component that filters datasets and renders SourcesTab
const FilteredSourcesTab = ({ 
    datasets, 
    activeYear, 
    activeName
}: { 
    datasets: Record<string, any[]>, 
    activeYear: string | null, 
    activeName: string | null
}) => {
    const filtered = useMemo(() => {
        const result: Record<string, any[]> = {}
        Object.keys(datasets).forEach((ds) => {
            result[ds] = (datasets[ds] || []).filter((s: any) => 
                matchesActiveYear(s, activeYear) && 
                matchesActiveName(s, activeName)
            )
        })
        return result
    }, [datasets, activeYear, activeName])

    const isFiltered = !!(activeYear || activeName)

    return <SourcesTab datasets={filtered} isFiltered={isFiltered} />
}


export default function GroupInfo({ id, overrideGroupCode }: { id: string, overrideGroupCode?: string }) {
    const { groupData, groupLoading } = useGroupData(overrideGroupCode)
    const prefTab = useSessionStore(state => state.prefTab)
    const setPrefTab = useSessionStore(state => state.setPrefTab)
    const openTabs = useSessionStore(state => state.openTabs)
    const setOpenTabs = useSessionStore(state => state.setOpenTabs)
    const searchParams = useSearchParams()
    const searchDatasets = searchParams.getAll('dataset')
    const { mapFunctionRef } = useContext(GlobalContext)
    const { initValue } = useGroup()
    const [activeYear, setActiveYear] = useState<string | null>(null)
    const [activeName, setActiveName] = useState<string | null>(null)

    // Helper function to clear all filters
    const clearAllFilters = () => {
        setActiveYear(null)
        setActiveName(null)
    }

    
    

    const { iiifItems, textItems, audioItems, datasets, locations } = useMemo(() => {
        const iiifItems: any[] = []
        const textItems: any[] = []
        const audioItems: any[] = []
        const locations: any[] = []
        const seenEnhetsid = new Set<string>()
        const datasets: Record<string, any[]> = {}

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
            }
            datasets[source.dataset] = datasets[source.dataset] || []
            datasets[source.dataset].push(source)
        })


        return { iiifItems, textItems, audioItems, datasets, locations }
    }, [groupData, searchDatasets])

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
                                src={`https://iiif.test.ubbe.no/iiif/audio/hord/${recording.file}`}
                                className="h-10 rounded-md
                                    [&::-webkit-media-controls-enclosure]:bg-transparent 
                                    [&::-webkit-media-controls-current-time-display]:text-neutral-800 
                                    [&::-webkit-media-controls-time-remaining-display]:text-neutral-800"
                            />
                            <Link href={`/iiif/${recording.manifest}`} className="ml-1 p-2 rounded-full aspect-square">
                                <PiArchive className="text-md text-neutral-800" aria-hidden="true"/>
                            </Link>
                        </div>
                        ))}
                    </div>
                ))
            }
            {iiifItems?.length > 0 && <>
                <Carousel items={iiifItems} />
            </>
            }
            {textItems.length > 0 && <TextTab textItems={textItems}/>}

            <div className="w-full pb-4 flex flex-col">
                {/* Names section (includes timeline) - only show when no filter is active */}
                {shouldShowLabelFilter &&
                    <div className="px-3 pt-2">
                        <NamesSection datasets={datasets} activeYear={activeYear} activeName={activeName} setActiveYear={setActiveYear} setActiveName={setActiveName} />
                    </div>
                }


                {/* Sources always shown */}
                <div className="px-3">
                    <FilteredSourcesTab 
                        datasets={datasets} 
                        activeYear={activeYear}
                        activeName={activeName}
                    />
                </div>
            </div>

            { initValue === groupData.group.id && groupData.fields?.label?.[0] && searchParams.get('q') !== groupData.fields.label[0] && (
                <div className="absolute bottom-0 right-0 p-3">
                    <Clickable 

                        add={{q: groupData.fields.label[0]}} 
                        className="h-6 btn btn-outline flex items-center gap-1 pl-1 pr-2 rounded-full flex items-center justify-center text-nowrap flex items-center gap-1"
                    >
                        <PiMagnifyingGlass className="text-neutral-700" /> {groupData.fields.label[0]}
                    </Clickable>
                </div>
            )}
            {locations.length > 0 && locations[0]?.location?.coordinates && initValue !== groupData.group.id && (
                <div className="absolute bottom-0 right-0 p-3">
                    <ClickableIcon 
                        onClick={() => {
                            const coords = locations[0].location.coordinates;
                            mapFunctionRef.current?.panTo([coords[1], coords[0]])
                        }}
                        remove={['group']}
                        add={{
                            point: `${locations[0].location.coordinates[1]},${locations[0].location.coordinates[0]}`,
                            init: stringToBase64Url(groupData.group.id)
                        }}
                        className="h-6 w-6 p-0 btn btn-outline rounded-full text-nowrap flex items-center gap-1"
                        label="Fest til toppen"
                    > 
                        <PiPushPinBold className="text-neutral-900" />
                    </ClickableIcon>
                </div>
            )}

        </div>
    );
}