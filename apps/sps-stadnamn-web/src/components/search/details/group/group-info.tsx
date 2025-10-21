import useGroupData from "@/state/hooks/group-data";
import Carousel from "../../nav/results/carousel";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { datasetTitles } from "@/config/metadata-config";
import { formatHtml } from "@/lib/text-utils";
import { resultRenderers } from "@/config/result-renderers";
import { PiMinusBold, PiMapPin, PiPlusBold, PiQuestionFill, PiXCircle, PiMapPinFill, PiInfoFill } from "react-icons/pi";
import WarningMessage from "./warning-message";
import { useSessionStore } from "@/state/zustand/session-store";
import { group } from "console";
import Spinner from "@/components/svg/Spinner";
import Link from "next/link";


// Collapses long HTML to a few lines with a toggle
const ExpandableHtml = (
    { html, clampLines = 4, leading }: { html: string, clampLines?: number, leading?: ReactNode }
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
    return (
        <>
            <span style={clampStyle}>
                {leading}
                {
                    (() => {
                        // Remove <p> tags
                        let htmlNoP = html.replace(/<\/?p>/g, '');
                        // Remove a single wrapping tag (e.g., <div>...</div> or <span>...</span>)
                        htmlNoP = htmlNoP.trim().replace(/^<([a-zA-Z0-9]+)[^>]*>([\s\S]*)<\/\1>$/i, '$2');
                        return formatHtml(expanded ? html : htmlNoP);
                    })()
                }
            </span>
            {isLong && (
                <button
                    type="button"
                    className="text-sm mt-2 mb-4 mr-2 flex items-center gap-1"
                    aria-expanded={expanded}
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? <><PiMinusBold aria-hidden="true" /> Vis mindre</> : <><PiPlusBold aria-hidden="true" /> Vis heile</>}
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
                    <div className="py-2" key={textItem.uuid + 'text'} id={`text-item-${textItem.uuid}`}>
                        {textItem.dataset === 'rygh' && (
                            <WarningMessage 
                                message="Feil i digitaliseringa av Norske Gaardnavne gjer at nokon teikn ikkje stemmer med originalen, særleg i lydskrift. Sjå trykt utgåve på nb.no"
                                messageId="rygh-phonetic-warning"
                            />
                        )}
                        <ExpandableHtml
                            leading={<><strong>{datasetTitles[textItem.dataset]}</strong> | </>}
                            html={(textItem.content.html ? textItem.content.html.replace(/<\/?p>/g, '') : textItem.content.html) || ''}
                        />
                        {links}
                    </div>
                );
            })}
            {textItems.length > 1 && (
                <button
                    type="button"
                    className="my-3 mr-2 flex items-center gap-1"
                    aria-expanded={showAll}
                    aria-controls={`text-items-${textItems.length}`}
                    onClick={() => setShowAll(v => !v)}
                >
                    {showAll ? <><PiMinusBold aria-hidden="true" /> Vis færre tolkingar</> : <><PiPlusBold aria-hidden="true" /> Vis fleire tolkingar ({textItems.length - 1})</>}
                </button>
            )}
        </>
    );
}


const SourcesTab = ({ datasets }: { datasets: Record<string, any[]> }) => {
    const [showMoreDatasets, setShowMoreDatasets] = useState<Record<string, boolean>>({})
    const [activeYear, setActiveYear] = useState<string | null>(null)
    const [activeName, setActiveName] = useState<string | null>(null)
    const [showTimelineDescription, setShowTimelineDescription] = useState(false)

	const { yearsOrdered, namesByYear, namesWithoutYear, nameCounts, itemsByDataset } = useMemo(() => {
		// 1) Empty structures
		const nameToYears: Record<string, Set<string>> = {}
		const nameCounts: Record<string, number> = {}
		const itemsByDataset: Record<string, any[]> = {}

		// 2) Build lookup from labels/altLabels (using source.year) and attestations (using att.year)
		const pushNameYear = (name: string | undefined, year: any) => {
			if (!name) return
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
					pushNameYear(source.label, source.year)
					if (Array.isArray(source?.altLabels)) {
						source.altLabels.forEach((alt: any) => pushNameYear(typeof alt === 'string' ? alt : alt?.label, source.year))
					}
				}
				// Attestations: use their own year
				if (Array.isArray(source?.attestations)) {
					source.attestations.forEach((att: any) => pushNameYear(att?.label, att?.year))
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
	}, [datasets])

    const toggleShowMore = (ds: string, next?: boolean) => setShowMoreDatasets((prev) => ({ ...prev, [ds]: typeof next === 'boolean' ? next : !prev[ds] }))

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

	return <>
		{yearsOrdered.length > 1 && <>
            {itemsByDataset['rygh']?.find((s: any) => s.attestations && s.attestations.length > 0) && (
                <WarningMessage 
                    message="Uregelmessigheiter i digitaliseringa av Norske Gaardnavne gjer at det kan førekomme ord i tidslinja som ikkje er namneformer. Sjå teksten dei er basert på under «Tolkingar»."
                    messageId="rygh-namnform-warning"
                />
            )}
        <ul className="relative mt-2 px-2">
           
            { yearsOrdered.map((year, idx) => {
				const isLast = idx === yearsOrdered.length - 1
				const nameKeys = namesByYear[year] || []
				return (
					<li key={year} className="flex items-center !pb-2 !pt-0 relative w-full">
						<div className={`bg-primary-300 absolute w-1 left-0 top-1 ${isLast ? 'h-4' : 'h-full'} ${idx === 0 ? 'mt-2' : ''}`}></div>
						<div className="w-3 h-3 rounded-full bg-primary-500 absolute -left-1 top-2"></div>
                        <div className="ml-5 flex w-full items-start">
                            <button
                                type="button"
                                onClick={() => { setActiveYear(activeYear === year ? null : year); setActiveName(null) }}
                                className={`mr-2 flex my-0 mt-0 font-medium ${activeYear === year ? 'text-primary-700' : 'text-neutral-700'} underline-offset-4 hover:underline text-base`}
                                aria-pressed={activeYear === year}
                            >
                                {year}
                            </button>
                            <ul className="flex flex-col gap-0.5">
                                {nameKeys.map((nameKey) => (
                                    <li key={`${year}__${nameKey}`} className="flex w-full py-1 first:pt-0">
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
			})}
		</ul>
        </>}

		{namesWithoutYear.length > 0 && (
			<div className="px-2">
				<span className="mr-2 my-1 mt-1 font-medium text-neutral-700">Utan årstal</span>
				<ul className="flex flex-col gap-1">
					{namesWithoutYear.sort().map((nameKey) => (
						<li key={`noYear__${nameKey}`} className="flex flex-col w-full">
							<div className="text-left flex items-center gap-3 py-2">
								<span className="font-medium">{nameKey}</span>
								<span className="text-sm text-neutral-700">({nameCounts[nameKey] || 0})</span>
							</div>
						</li>
					))}
				</ul>
			</div>
		)}

        <div className="pt-2">
            {(activeYear || activeName) && (
                <div className="flex items-center gap-2 pb-2 text-sm">
                    <span className="text-neutral-700">Filter:</span>
                    {activeYear && <span className="px-2 py-0.5 bg-neutral-100 rounded-full">År: {activeYear}</span>}
                    {activeName && <span className="px-2 py-0.5 bg-neutral-100 rounded-full">Namn: {activeName}</span>}
                    <button type="button" className="ml-auto underline underline-offset-4" onClick={() => { setActiveYear(null); setActiveName(null) }}>Nullstill</button>
                </div>
            )}
            <ul className="flex flex-col divide-y divide-neutral-200 w-full gap-4">
                {Object.keys(itemsByDataset).map((ds) => {
                    const items = (itemsByDataset[ds] || []).filter((s: any) => matchesActiveYear(s) && matchesActiveName(s))
                    if (items.length === 0) return null
                    const hasFilter = !!(activeYear || activeName)
                    const autoShowAll = hasFilter && items.length <= 5
                    const isExpanded = autoShowAll || !!showMoreDatasets[ds]
                    const shouldCollapse = hasFilter ? items.length > 5 : items.length > 2
                    const collapseCount = hasFilter ? 4 : 1
                    const visibleItems = (isExpanded || !shouldCollapse) ? items : items.slice(0, collapseCount)
                    return (
                        <li key={`ds-${ds}`} className="flex flex-col w-full py-1">
                            <div className="text-left flex items-center gap-3 py-2">
                                <span className="text-neutral-900 uppercase tracking-wider">{datasetTitles[ds] || ds}</span>
                            </div>
                            <ul className="flex flex-col w-full -mx-2">
                                {visibleItems.map((s: any) => {
                                    const additionalLabels = Array.from(
                                        new Set([
                                            ...(s.altLabels ?? []),
                                            ...(s.attestations?.map((a: any) => a.label) ?? [])
                                        ].filter(l => l && l !== s.label))
                                    ).join(", ");

                                    return <li key={s.uuid} className="px-2 py-1">
                                        <Link className="no-underline hover:underline" href={"/uuid/" + s.uuid}><strong>{s.label}</strong></Link> 
                                        {s.altLabels} {additionalLabels && <span className="text-neutral-900"> – {additionalLabels}</span>}
                                        
                                        {resultRenderers[ds]?.links?.(s)}
                                    </li>
                                })}
                                {!autoShowAll && shouldCollapse && !isExpanded && (
                                    <li className="px-2 py-1">
                                        <button
                                            type="button"
                                            className="text-sm text-neutral-800 flex items-center gap-1"
                                            onClick={() => toggleShowMore(ds, true)}
                                        >
                                            <PiPlusBold aria-hidden="true" /> {`Vis fleire (${items.length - visibleItems.length})`}
                                        </button>
                                    </li>
                                )}
                                {!autoShowAll && shouldCollapse && isExpanded && (
                                    <li className="px-2 py-1">
                                        <button
                                            type="button"
                                            className="text-sm text-neutral-800 flex items-center gap-1"
                                            onClick={() => toggleShowMore(ds, false)}
                                        >
                                            <PiMinusBold aria-hidden="true" /> Vis færre
                                        </button>
                                    </li>
                                )}
                            </ul>
                        </li>
                    )
				})}
			</ul>
		</div>
	</>
}

const LocationsTab = ({ locations }: { locations: any[] }) => {
    if (!locations || locations.length === 0) return null;

    // Group locations by coordinates (lat, lon as key)
    const groupedByCoords: Record<string, any[]> = {};
    locations.forEach(location => {
        if (!location.location?.coordinates || location.location.coordinates.length < 2) return;
        const [lon, lat] = location.location.coordinates;
        const key = `${Number(lat).toFixed(6)},${Number(lon).toFixed(6)}`;
        groupedByCoords[key] = groupedByCoords[key] || [];
        groupedByCoords[key].push(location);
    });

    return (
        <div className="flex flex-col gap-4 py-2">
            {Object.entries(groupedByCoords).map(([coords, group]) => {
                const [lat, lon] = coords.split(',');
                
                return (
                    <div key={coords} className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <PiMapPinFill aria-hidden="true" className="text-primary-700 flex-shrink-0 text-lg" />
                            <span className="text-neutral-900">
                                {lat}, {lon}
                            </span>
                        </div>
                        <div className="ml-6 flex flex-col gap-1">
                            {group.map((location, index) => (
                                <div key={location.uuid || index} className=" text-neutral-800">
                                    {location.label}
                                </div>
                            ))}
                        </div>
                    </div>
                )
            })}
        </div>
    );
}

const TabButton = ({ groupData, tab, label }: { groupData: any, tab: 'text' | 'sources' | 'locations', label: string }) => {
    
    const setPrefTab = useSessionStore(state => state.setPrefTab)
    const setOpenTabs = useSessionStore(state => state.setOpenTabs)
    const openTabs = useSessionStore(state => state.openTabs)
    const isActive = openTabs[groupData.group.id] === tab
    
    return (
        <button
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className="py-2 px-3"
            onClick={() => { setOpenTabs(groupData.group.id, tab); setPrefTab(tab) }}
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
    

    const { iiifItems, textItems, audioItems, datasets, locations } = useMemo(() => {
        const iiifItems: any[] = []
        const textItems: any[] = []
        const audioItems: any[] = []
        const locations: any[] = []
        const seenEnhetsid = new Set<string>()
        const datasets: Record<string, any[]> = {}
        
        groupData?.sources?.forEach((source: any) => {
            if (source.iiif) {
                iiifItems.push(source)
            }
            if (source.content?.html) {

                textItems.push(source)
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
    }, [groupData])

    useEffect(() => {
        if (groupData?.group.id) {
            const groupId = groupData.group.id;
            const currentTab = openTabs[groupId];
            
            // 1. Check if there's already a value stored at the id in openTabs
            if (currentTab) {
                // Verify the tab is still valid for this group
                if (currentTab === 'text' && textItems.length > 0) {
                    return; // Keep the existing tab
                }
                if (currentTab === 'sources') {
                    return; // Keep the existing tab
                }
                if (currentTab === 'locations' && locations.length > 0) {
                    return; // Keep the existing tab
                }
            }
            
            // 2. Use prefTab if the group has the required content
            if (prefTab === 'text' && textItems.length > 0) {
                setOpenTabs(groupId, 'text');
                return;
            }
            if (prefTab === 'sources') {
                setOpenTabs(groupId, 'sources');
                return;
            }
            if (prefTab === 'locations' && locations.length > 0) {
                setOpenTabs(groupId, 'locations');
                return;
            }
            
            // 3. Default fallback: text if available, otherwise sources
            if (textItems.length > 0) {
                setOpenTabs(groupId, 'text');
            } else {
                setOpenTabs(groupId, 'sources');
            }
        }
    }, [groupData?.group.id, textItems.length, locations.length, openTabs, prefTab, setOpenTabs])


    if (groupLoading) return (
        <div className="flex justify-center items-center w-full py-8">
            <Spinner status="Laster" className="animate-spin rounded-full h-8 w-8"></Spinner>
        </div>
    )

    const isGrunnord = Object.keys(datasets).some((ds: any) => ds.includes('_g'))





    return (
        <div id={id} className="w-full flex flex-col gap-2 my-2 pb-8">
            {
                audioItems?.map((audioItem) => (
                    <div key={audioItem.uuid + 'audio'}>{JSON.stringify(audioItem)}</div>
                ))
            }
            {iiifItems?.length > 0 && <>
                <Carousel items={iiifItems} />
            </>
            }

            <div className="w-full">
                {(locations.length > 0 || Object.keys(datasets).length > 1) && !isGrunnord && <TabList>
                    {textItems.length > 0 && (
                        <TabButton groupData={groupData} tab="text" label="Tolkingar" />
                    )}
                    <TabButton groupData={groupData} tab="sources" label="Kjelder" />
                    {locations.length > 0 && <TabButton groupData={groupData} tab="locations" label="Lokalitetar" />}
                    
                </TabList>}



                    <div role="tabpanel" className="px-3" id={`tabpanel-${groupData.group.id}`} aria-labelledby={`tab-${openTabs[groupData.group.id]}`}>
                        {openTabs[groupData.group.id] === 'text' && <TextTab textItems={textItems} />}
                        {openTabs[groupData.group.id] === 'sources' && <SourcesTab datasets={datasets} />}
                        {openTabs[groupData.group.id] === 'locations' && <LocationsTab locations={locations} />}
                    </div>


            </div>


        </div>
    );
}