import useGroupData from "@/state/hooks/group-data";
import Carousel from "../../nav/results/carousel";
import { useEffect, useMemo, useState, useContext, type ReactNode } from "react";
import { datasetTitles } from "@/config/metadata-config";
import { formatHtml } from "@/lib/text-utils";
import { defaultResultRenderer, resultRenderers } from "@/config/result-renderers";
import { PiMinusBold, PiMapPin, PiPlusBold, PiQuestionFill, PiMapPinFill, PiInfoFill, PiArchive, PiInfo, PiPushPinBold, PiPushPinFill, PiMagnifyingGlass, PiPushPin } from "react-icons/pi";
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

// Collapses long HTML to a few lines with a toggle
const ExpandableContent = (
    { html, text, clampLines = 4, leading }: { html: string, text: string, clampLines?: number, leading?: ReactNode }
) => {
    const [expanded, setExpanded] = useState(false)
    const plain = typeof html === 'string' ? html.replace(/<[^>]*>/g, '') : ''
    const isLong = (plain || '').length > 300
    const clampStyle = expanded || !isLong ? {} : {
        display: '-webkit-box',
        WebkitLineClamp: String(clampLines),
        WebkitBoxOrient: 'vertical' as any,
        overflow: 'hidden'
    }
    if (!html && !text) return null;


    return (
        <>
            <span style={clampStyle}>
                {leading}
                { html ? 
                    (() => {
                        // Remove <p> tags
                            let htmlNoP = html.replace(/<\/?p>/g, '');
                            // Remove a single wrapping tag (e.g., <div>...</div> or <span>...</span>)
                            htmlNoP = htmlNoP.trim().replace(/^<([a-zA-Z0-9]+)[^>]*>([\s\S]*)<\/\1>$/i, '$2');
                            return formatHtml(expanded ? html : htmlNoP);
                        })()
                    : text
                }
            </span>
            {isLong && (
                <button
                    type="button"
                    className="text-sm mt-2 mb-4 mr-2 flex items-center gap-1"
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

    if (!textItems || textItems.length === 0) return null;

    const visibleItems = showAll ? textItems : textItems.slice(0, 1);

    return (
        <>
            {visibleItems.map((textItem) => {
                const links = resultRenderers[textItem.dataset]?.links?.(textItem);
                return (
                    <div className="py-2 px-3" key={textItem.uuid + 'text'} id={`text-item-${textItem.uuid}`}>
                        {textItem.dataset === 'rygh' && (
                            <WarningMessage 
                                message="Feil i digitaliseringa av Norske Gaardnavne gjer at nokon teikn ikkje stemmer med originalen, særleg i lydskrift. Sjå trykt utgåve på nb.no"
                                messageId="rygh-phonetic-warning"
                            />
                        )}
                        <ExpandableContent
                            leading={<><strong>{datasetTitles[textItem.dataset]}</strong> | </>}
                            html={(textItem.content.html ? textItem.content.html.replace(/<\/?p>/g, '') : textItem.content.html) || null}
                            text={textItem.content?.text || null}
                        />
                        {links}
                    </div>
                );
            })}
            {textItems.length > 1 && (
                <button
                    type="button"
                    className="mx-3 flex items-center gap-1"
                    aria-expanded={showAll}
                    aria-controls={`text-items-${textItems.length}`}
                    onClick={() => setShowAll(v => !v)}
                >
                    {showAll ? <>Vis færre tolkingar</> : <>Vis fleire tolkingar ({textItems.length - 1})</>}
                </button>
            )}
        </>
    );
}


const SourcesTab = ({ datasets, isFiltered }: { datasets: Record<string, any[]>, isFiltered: boolean }) => {
    const [showAll, setShowAll] = useState(false)
    const datasetKeys = useMemo(() => Object.keys(datasets).filter(ds => datasets[ds] && datasets[ds].length > 0), [datasets])

    // If not filtered: show 2 if more than 3, otherwise show all
    // If filtered: show 4 if more than 5, otherwise show all
    const hasMore = isFiltered ? datasetKeys.length > 5 : datasetKeys.length > 3
    const visibleCount = isFiltered ? (hasMore ? 4 : datasetKeys.length) : (hasMore ? 2 : datasetKeys.length)
    const visibleDatasets = showAll ? datasetKeys : datasetKeys.slice(0, visibleCount)

    return (
        <ul className="flex flex-col w-full gap-6 pt-6">
            {visibleDatasets.map((ds) => {
                const items = datasets[ds] || []
                if (items.length === 0) return null
                
                return (
                    <li key={`sources-ds-${ds}`} className="flex flex-col w-full gap-1">
                        <div className="flex items-center gap-1 text-neutral-700">
                            <span className="text-sm">{datasetTitles[ds] || ds}</span>
                            <ClickableIcon
                                href={`/info/datasets/${ds}`}
                                className="flex items-center"
                            label="Om datasettet"
                            >
                                <PiInfoFill className="text-primary-700 text-sm align-middle" aria-hidden="true" />
                            </ClickableIcon>
                        </div>
                        <ul className="flex flex-col w-full -mx-2">
                            {items.map((s: any) => {
                                const additionalLabels = Array.from(
                                    new Set([
                                        ...(s.altLabels ?? []),
                                        ...(s.attestations?.map((a: any) => a.label) ?? [])
                                    ].filter((l: any) => l && l !== s.label))
                                ).join(", ")

                                return (
                                    <li key={s.uuid} className="px-2 py-1">
                                        <Link className="no-underline hover:underline" href={"/uuid/" + s.uuid}><strong>{s.label}</strong></Link>
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
                <li>
                    <button
                        type="button"
                        className="text-sm text-neutral-800 flex items-center gap-1"
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? 'Vis færre' : `Vis fleire kjelder (${datasetKeys.length - visibleCount})`}
                    </button>
                </li>
            )}
        </ul>
    )
}

const NamesSection = ({ datasets, locations, activeYear, activeName, activeCoordinate, setActiveYear, setActiveName, setActiveCoordinate }: { datasets: Record<string, any[]>, locations: any[], activeYear: string | null, activeName: string | null, activeCoordinate: string | null, setActiveYear: (year: string | null) => void, setActiveName: (name: string | null) => void, setActiveCoordinate: (coord: string | null) => void }) => {
    const [showAll, setShowAll] = useState(false)

	const { yearsOrdered, namesByYear, namesWithoutYear, nameCounts, itemsByDataset } = useMemo(() => {
		// 1) Empty structures
		const nameToYears: Record<string, Set<string>> = {}
		const nameCounts: Record<string, number> = {}
		const itemsByDataset: Record<string, any[]> = {}

		// Helper to check if source matches coordinate filter
		const matchesCoordinate = (source: any) => {
			if (!activeCoordinate) return true
			if (!source.location?.coordinates || source.location.coordinates.length < 2) return false
			const [lon, lat] = source.location.coordinates
			const key = `${Number(lat).toFixed(6)},${Number(lon).toFixed(6)}`
			return key === activeCoordinate
		}

		// 2) Build lookup from labels/altLabels (using source.year) and attestations (using att.year)
		const pushNameYear = (name: string | undefined, year: any, source: any) => {
			if (!name) return
			// Only include if source matches coordinate filter
			if (!matchesCoordinate(source)) return
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
	}, [datasets, activeCoordinate])

    const matchesActiveYear = (s: any) => {
        if (!activeYear) return true
        if (String(s?.year) === activeYear) return true
        if (Array.isArray(s?.attestations)) {
            if (s.attestations.some((a: any) => String(a?.year) === activeYear)) return true
        }
        return false
    }
    const matchesActiveName = (s: any) => {
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

	const allItems = [...yearsOrdered.map(y => ({ type: 'year' as const, year: y, names: namesByYear[y] || [] })), ...namesWithoutYear.map(n => ({ type: 'noYear' as const, name: n, count: nameCounts[n] || 0 }))]
	const hasMore = allItems.length > 3
	const visibleItems = showAll ? allItems : allItems.slice(0, hasMore ? 2 : Math.min(3, allItems.length))

	if (allItems.length === 0) return null

	return (
		<div className="flex flex-col gap-2 py-2">
			{itemsByDataset['rygh']?.find((s: any) => s.attestations && s.attestations.length > 0) && (
				<WarningMessage 
					message="Uregelmessigheiter i digitaliseringa av Norske Gaardnavne gjer at det kan førekomme ord i tidslinja som ikkje er namneformer. Sjå teksten dei er basert på under «Tolkingar»."
					messageId="rygh-namnform-warning"
				/>
			)}
			<ul className="relative mt-2 px-2">
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
										onClick={() => { setActiveYear(activeYear === item.year ? null : item.year); setActiveName(null) }}
										className={`mr-2 flex my-0 mt-0 font-medium ${activeYear === item.year ? 'text-primary-700' : 'text-neutral-700'} underline-offset-4 hover:underline text-base`}
										aria-pressed={activeYear === item.year}
									>
										{item.year}
									</button>
									<ul className="flex flex-col gap-0.5">
										{nameKeys.map((nameKey) => (
											<li key={`${item.year}__${nameKey}`} className="flex w-full py-1 first:pt-0">
												<button
													type="button"
													onClick={() => { setActiveName(activeName === nameKey ? null : nameKey); setActiveYear(null) }}
													className={`text-left flex items-center gap-2 ${activeName === nameKey ? 'text-primary-700' : ''} hover:underline underline-offset-4`}
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
					className="text-sm text-neutral-800 flex items-center gap-1 px-2 py-1"
					onClick={() => setShowAll(!showAll)}
				>
					{showAll ? 'Vis færre' : `Vis fleire namneformer (${allItems.length - visibleItems.length})`}
				</button>
			)}
			{/* Coordinates below timeline */}
			{locations.length > 0 && (
				<div className="pt-4">
					<LocationsSection locations={locations} datasets={datasets} activeCoordinate={activeCoordinate} activeYear={activeYear} activeName={activeName} setActiveCoordinate={setActiveCoordinate} />
				</div>
			)}
		</div>
	)
}

const LocationsSection = ({ locations, datasets, activeCoordinate, activeYear, activeName, setActiveCoordinate }: { locations: any[], datasets: Record<string, any[]>, activeCoordinate: string | null, activeYear: string | null, activeName: string | null, setActiveCoordinate: (coord: string | null) => void }) => {
    const [showAll, setShowAll] = useState(false)
    
    if (!locations || locations.length === 0) return null;

    // Helper functions to check if source matches filters
    const matchesActiveYear = (s: any) => {
        if (!activeYear) return true
        if (String(s?.year) === activeYear) return true
        if (Array.isArray(s?.attestations)) {
            if (s.attestations.some((a: any) => String(a?.year) === activeYear)) return true
        }
        return false
    }
    const matchesActiveName = (s: any) => {
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

    // Group locations by coordinates and filter based on activeYear/activeName
    const groupedByCoords: Record<string, any[]> = {};
    const allSources = Object.values(datasets).flat()
    
    locations.forEach(location => {
        if (!location.location?.coordinates || location.location.coordinates.length < 2) return;
        // Check if this location's source matches the year/name filters
        const source = allSources.find(s => s.uuid === location.uuid)
        if (source && !matchesActiveYear(source)) return
        if (source && !matchesActiveName(source)) return
        
        const [lon, lat] = location.location.coordinates;
        const key = `${Number(lat).toFixed(6)},${Number(lon).toFixed(6)}`;
        groupedByCoords[key] = groupedByCoords[key] || [];
        groupedByCoords[key].push(location);
    });

    const coordEntries = Object.entries(groupedByCoords)
    const hasMore = coordEntries.length > 3
    const visibleCoords = showAll ? coordEntries : coordEntries.slice(0, hasMore ? 2 : Math.min(3, coordEntries.length))

    return (
        <div className="flex flex-col gap-4 py-2">
            {visibleCoords.map(([coords]) => {
                const [lat, lon] = coords.split(',');
                
                return (
                    <div key={coords} className="flex items-center gap-2">
                        
                        <ClickableIcon add={{point: coords}} label="Vis på kart"><PiMapPinFill aria-hidden="true" className="text-primary-700 flex-shrink-0 text-lg" /></ClickableIcon>
                        <button
                            type="button"
                            onClick={() => setActiveCoordinate(activeCoordinate === coords ? null : coords)}
                            className={`text-neutral-900 hover:underline underline-offset-4 ${activeCoordinate === coords ? 'text-primary-700' : ''}`}
                        >
                            {lat}, {lon}
                        </button>
                    </div>
                )
            })}
            {hasMore && (
                <button
                    type="button"
                    className="text-sm text-neutral-800 flex items-center gap-1 px-2 py-1"
                    onClick={() => setShowAll(!showAll)}
                >
                    {showAll ? 'Vis færre' : `Vis fleire lokalitetar (${coordEntries.length - visibleCoords.length})`}
                </button>
            )}
        </div>
    );
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
    const [activeCoordinate, setActiveCoordinate] = useState<string | null>(null)

    
    

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

    const showNamesTab = useMemo(() => {
        // Replicate NamesTab's filter determinism: timeline or names without year
        const nameToYears: Record<string, Set<string>> = {}
        Object.values(datasets).forEach((sources: any[]) => {
            sources.forEach((source: any) => {
                const push = (name: string | undefined, year: any) => {
                    if (!name) return
                    const y = year != null ? String(year) : null
                    if (!y) return
                    nameToYears[name] = nameToYears[name] || new Set<string>()
                    nameToYears[name].add(y)
                }
                if (source?.year) {
                    push(source.label, source.year)
                    if (Array.isArray(source?.altLabels)) {
                        source.altLabels.forEach((alt: any) => push(typeof alt === 'string' ? alt : alt?.label, source.year))
                    }
                }
                if (Array.isArray(source?.attestations)) {
                    source.attestations.forEach((att: any) => push(att?.label, att?.year))
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

            <div className="w-full border-t border-neutral-200 py-4 gap-2 flex flex-col">
                {/* Names section (includes timeline and coordinates) */}
                {showNamesTab && (
                    <div className="px-3">
                        <NamesSection datasets={datasets} locations={locations} activeYear={activeYear} activeName={activeName} activeCoordinate={activeCoordinate} setActiveYear={setActiveYear} setActiveName={setActiveName} setActiveCoordinate={setActiveCoordinate} />
                    </div>
                )}

                {/* Locations section (only if names section is not shown) */}
                {!showNamesTab && locations.length > 0 && (
                    <div className="px-3">
                        <LocationsSection locations={locations} datasets={datasets} activeCoordinate={activeCoordinate} activeYear={activeYear} activeName={activeName} setActiveCoordinate={setActiveCoordinate} />
                    </div>
                )}

                {/* Active filters above sources */}
                {(activeYear || activeName || activeCoordinate) && (
                    <div className="px-3 pb-2">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-neutral-700">Filter:</span>
                            {activeYear && <span className="px-2 py-0.5 bg-neutral-100 rounded-full">År: {activeYear}</span>}
                            {activeName && <span className="px-2 py-0.5 bg-neutral-100 rounded-full">Namn: {activeName}</span>}
                            {activeCoordinate && (
                                <span className="px-2 py-0.5 bg-neutral-100 rounded-full">
                                    Koordinat: {activeCoordinate.split(',')[0]}, {activeCoordinate.split(',')[1]}
                                </span>
                            )}
                            <button 
                                type="button" 
                                className="ml-auto underline underline-offset-4" 
                                onClick={() => { 
                                    setActiveYear(null); 
                                    setActiveName(null); 
                                    setActiveCoordinate(null);
                                }}
                            >
                                Nullstill
                            </button>
                        </div>
                    </div>
                )}

                {/* Sources always shown */}
                <div className="px-3">
                    {(() => {
                        // Apply filters to datasets
                        const matchesActiveYear = (s: any) => {
                            if (!activeYear) return true
                            if (String(s?.year) === activeYear) return true
                            if (Array.isArray(s?.attestations)) {
                                if (s.attestations.some((a: any) => String(a?.year) === activeYear)) return true
                            }
                            return false
                        }
                        const matchesActiveName = (s: any) => {
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
                        const matchesActiveCoordinate = (s: any) => {
                            if (!activeCoordinate) return true
                            if (!s.location?.coordinates || s.location.coordinates.length < 2) return false
                            const [lon, lat] = s.location.coordinates
                            const key = `${Number(lat).toFixed(6)},${Number(lon).toFixed(6)}`
                            return key === activeCoordinate
                        }

                        const filtered: Record<string, any[]> = {}
                        Object.keys(datasets).forEach((ds) => {
                            filtered[ds] = (datasets[ds] || []).filter((s: any) => 
                                matchesActiveYear(s) && matchesActiveName(s) && matchesActiveCoordinate(s)
                            )
                        })
                        const isFiltered = !!(activeYear || activeName || activeCoordinate)
                        return <SourcesTab datasets={filtered} isFiltered={isFiltered} />
                    })()}
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