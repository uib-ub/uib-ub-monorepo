import useGroupData from "@/state/hooks/group-data";
import Carousel from "../../nav/results/carousel";
import { useContext, useMemo, useState, type ReactNode } from "react";
import { datasetTitles } from "@/config/metadata-config";
import { formatHtml } from "@/lib/text-utils";
import { resultRenderers } from "@/config/result-renderers";
import { GlobalContext } from "@/state/providers/global-provider";


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
                        <strong>{datasetTitles[textItem.dataset]}</strong> | {formatHtml(
                            textItem.content.html
                                ? textItem.content.html.replace(/<\/?p>/g, '')
                                : textItem.content.html
                        )}
                        {links}
                    </div>
                );
            })}
            {textItems.length > 1 && (
                <button
                    type="button"
                    className="text-sm underline underline-offset-4 py-1"
                    aria-expanded={showAll}
                    aria-controls={`text-items-${textItems.length}`}
                    onClick={() => setShowAll(v => !v)}
                >
                    {showAll ? `Vis færre tolkingar` : `Vis fleire tolkingar (${textItems.length - 1})`}
                </button>
            )}
        </>
    );
}


const SourcesTab = ({ datasets }: { datasets: Record<string, any[]> }) => {
    const [showMoreDatasets, setShowMoreDatasets] = useState<Record<string, boolean>>({})
    const [activeYear, setActiveYear] = useState<string | null>(null)
    const [activeName, setActiveName] = useState<string | null>(null)

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
		{yearsOrdered.length > 1 && <ul className="relative !mx-2 mt-4 !px-0">
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
		</ul>}

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

        <div className="px-2 pt-2">
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
                                <span className="font-medium text-sm text-neutral-900 uppercase tracking-wider">{datasetTitles[ds] || ds}</span>
                                <span className="flex-1" />
                            </div>
                            <ul className="flex flex-col w-full -mx-2">
                                {visibleItems.map((s: any) => (
                                    <li key={s.uuid} className="px-2 py-1">
                                        <div className="text-sm">{s.label}</div>
                                    </li>
                                ))}
                                {!autoShowAll && shouldCollapse && !isExpanded && (
                                    <li className="px-2 py-1">
                                        <button
                                            type="button"
                                            className="text-sm underline underline-offset-4"
                                            onClick={() => toggleShowMore(ds, true)}
                                        >
                                            {`Vis fleire (${items.length - visibleItems.length})`}
                                        </button>
                                    </li>
                                )}
                                {!autoShowAll && shouldCollapse && isExpanded && (
                                    <li className="px-2 py-1">
                                        <button
                                            type="button"
                                            className="text-sm underline underline-offset-4"
                                            onClick={() => toggleShowMore(ds, false)}
                                        >
                                            Vis færre
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
    return locations.map((location: any) => (
        <div key={location.uuid + 'location'}>{location.label}</div>
    ))
}

const TabButton = ({ openTab, setOpenTab, tab, label }: { openTab: string | null, setOpenTab: (tab: string) => void, tab: string, label: string }) => {
    const isActive = openTab === tab
    return (
        <button
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className="pb-2 px-3"
            onClick={() => setOpenTab(tab)}
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
    const { isMobile } = useContext(GlobalContext)
    return (
        <div
            role="tablist"
            aria-label="Gruppefaner"
            className={`flex ${isMobile ? 'text-sm' : 'text-xs 2xl:text-sm'}`}
        >
            {children}
        </div>
    )
}


export default function GroupInfo({ overrideGroupCode }: { overrideGroupCode?: string }) {
    const { groupData } = useGroupData(overrideGroupCode)
    const [openTab, setOpenTab] = useState<string | null>(null)

    const { iiifItems, textItems, audioItems, datasets } = useMemo(() => {
        const iiifItems: any[] = []
        const textItems: any[] = []
        const audioItems: any[] = []
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
            datasets[source.dataset] = datasets[source.dataset] || []
            datasets[source.dataset].push(source)
        })
        if (textItems.length > 0) {
            setOpenTab('text')
        } else {
            setOpenTab('sources')
        }

        return { iiifItems, textItems, audioItems, datasets }
    }, [groupData])



    return (
        <div className="w-full flex flex-col gap-2 my-2 pb-8">
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
                <TabList>
                    {textItems.length > 0 && (
                        <TabButton openTab={openTab} setOpenTab={setOpenTab} tab="text" label="Tolking" />
                    )}
                    <TabButton openTab={openTab} setOpenTab={setOpenTab} tab="sources" label="Kjelder" />
                    <TabButton openTab={openTab} setOpenTab={setOpenTab} tab="places" label="Lokalitetar" />
                    
                </TabList>


                    <div role="tabpanel" className="px-3" id={`tabpanel-${openTab}`} aria-labelledby={`tab-${openTab}`}>
                        {openTab === 'text' && <TextTab textItems={textItems} />}
                        {openTab === 'sources' && <SourcesTab datasets={datasets} />}
                        {openTab === 'locations' && <LocationsTab locations={[]} />}
                    </div>


            </div>


        </div>
    );
}