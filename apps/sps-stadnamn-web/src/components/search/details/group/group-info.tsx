import Spinner from "@/components/svg/Spinner";
import Clickable from "@/components/ui/clickable/clickable";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import { datasetTitles } from "@/config/metadata-config";
import { fitBoundsToGroupSources } from "@/lib/map-utils";
import { useGroup } from "@/lib/param-hooks";
import { stringToBase64Url } from "@/lib/param-utils";
import useGroupData from "@/state/hooks/group-data";
import { GlobalContext } from "@/state/providers/global-provider";
import { useSessionStore } from "@/state/zustand/session-store";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useMemo, type ReactNode } from "react";
import { PiArchive, PiCaretLeftBold, PiCaretRightBold, PiMapPin, PiPushPin, PiX } from "react-icons/pi";
import Carousel from "../../nav/results/carousel";
import { TextTab } from "./text-tab";
import { NamesSection } from "./names-section";
import { FilteredSourcesTab } from "./sources-tab";
import { matchesActiveYear, matchesActiveName, pushNameYear } from "./group-utils";

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

    const roundCoordString = (value: string, decimals: number) => {
        const n = Number(value)
        if (!Number.isFinite(n)) return value.trim()
        const fixed = n.toFixed(decimals)
        // Trim trailing zeros (and possible trailing dot) for nicer display
        return fixed.replace(/\.?0+$/, '')
    }

    const formatCoordText = (lat: string, lng: string) => {
        // Light rounding for readability (selection is by index, so no ambiguity)
        const d = 6
        return `N ${roundCoordString(lat, d)}°, Ø ${roundCoordString(lng, d)}°`
    }

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
        const seenIiifUuids = new Set<string>()




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
            if (source.iiif && (!source.uuid || !seenIiifUuids.has(source.iiif))) {
                iiifItems.push(source)
                if (source.uuid) seenIiifUuids.add(source.iiif)
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
        const totalUniqueNames = Object.keys(nameToYears).length
        const totalYears = yearsOrdered.length

        // Don't show filter if there's only one filter option total
        // (one year and one name, or one name with no years, or one year with no names)
        if (totalYears === 1 && totalUniqueNames === 1) {
            return false
        }
        if (totalYears === 0 && totalUniqueNames === 1) {
            return false
        }
        if (totalYears === 1 && totalUniqueNames === 0) {
            return false
        }

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
        <div id={id} className="relative flex min-w-0 flex-wrap items-center gap-2 pb-4">

            {
                audioItems?.map((audioItem) => (
                    <div key={audioItem.uuid + 'audio'}>
                        {audioItem.recordings.map((recording: any, index: number) => (
                            <div key={"audio-" + recording.uuid} className="flex items-center">
                                <audio
                                    controls
                                    aria-label={`Lydopptak${audioItems.length > 1 ? ` ${index + 1} av ${audioItem.recordings.length}` : ''}`}
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

            <div className="min-w-0 w-full flex flex-col pb-4">
                {/* Names section (includes timeline) - only show in init group when no activePoint filter is active */}
                {shouldShowLabelFilter && initValue === groupData.group.id && !searchParams.get('activePoint') &&
                    <div className="px-3 pt-2">
                        <NamesSection datasets={datasets} />
                    </div>
                }

                {/* Active point filter display - only in init group. Sticky so it stays put; coordinate + nav in a right-aligned group so expandables below cannot affect their position. */}
                {searchParams.get('activePoint') && initValue === groupData.group.id && (
                    <div className="sticky top-0 z-10 w-full shrink-0 border-b border-neutral-100 bg-white px-3 pt-2 pb-2">
                        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
                            <Clickable
                                remove={['activePoint']}
                                aria-label="Tilbake"
                                className="inline-flex shrink-0 items-center gap-1.5 text-neutral-800 hover:text-neutral-900"
                            >
                                <PiCaretLeftBold className="text-base shrink-0" aria-hidden="true" />
                                <span className="whitespace-nowrap">Tilbake</span>
                            </Clickable>
                            <div className="flex min-w-[8rem] flex-1 basis-0 flex-wrap items-center justify-end gap-x-3 gap-y-2 sm:basis-auto sm:flex-1">
                                {(() => {
                                    const total = uniqueCoordinates.length
                                    const activeIndexRaw = uniqueCoordinates.findIndex((c) => c === activePoint)
                                    const activeIndex = activeIndexRaw >= 0 ? activeIndexRaw : 0
                                    const coord = uniqueCoordinates[activeIndex]
                                    const [latStr, lngStr] = coord ? coord.split(',') : ['', '']
                                    const coordText = coord ? formatCoordText(latStr, lngStr) : 'koordinater'

                                    const NavBtn = ({
                                        label,
                                        targetIndex,
                                        disabled,
                                        children
                                    }: {
                                        label: string
                                        targetIndex: number
                                        disabled: boolean
                                        children: ReactNode
                                    }) => {
                                        const c = uniqueCoordinates[targetIndex]
                                        const [lat, lng] = c.split(',').map(parseFloat)
                                        return (
                                            <Clickable
                                                add={{ activePoint: c }}
                                                disabled={disabled}
                                                onClick={() => {
                                                    if (disabled) return
                                                    setTimeout(() => {
                                                        mapFunctionRef.current?.flyTo([lat, lng], 15, { duration: 0.25, maxZoom: 18, padding: [50, 50] })
                                                    }, 0)
                                                }}
                                                className={`h-9 w-9 shrink-0 inline-flex items-center justify-center rounded-md text-sm transition-colors border border-neutral-200 ${disabled
                                                    ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                                                    : 'bg-white text-neutral-900 hover:bg-neutral-200'
                                                    }`}
                                                aria-label={label}
                                                title={label}
                                            >
                                                {children}
                                            </Clickable>
                                        )
                                    }

                                    return (
                                        <>
                                            <span className="min-w-0 flex-1 truncate text-right text-base font-medium text-neutral-900" title={coordText}>
                                                {coordText}
                                            </span>
                                            <div className="flex shrink-0 items-center gap-1.5">
                                                <NavBtn label="Førre koordinat" targetIndex={Math.max(0, activeIndex - 1)} disabled={activeIndex === 0}>
                                                    <PiCaretLeftBold aria-hidden="true" />
                                                </NavBtn>
                                                <span className="text-neutral-700 text-sm tabular-nums w-9 text-center" aria-hidden="true">
                                                    {activeIndex + 1}/{total}
                                                </span>
                                                <NavBtn label="Neste koordinat" targetIndex={Math.min(total - 1, activeIndex + 1)} disabled={activeIndex === total - 1}>
                                                    <PiCaretRightBold aria-hidden="true" />
                                                </NavBtn>
                                            </div>
                                        </>
                                    )
                                })()}
                            </div>
                        </div>
                    </div>
                )}

                {/* Sources always shown - min-w-0 so width is constrained by panel, not by expanded content */}
                <div className="min-w-0 px-3">
                    <FilteredSourcesTab
                        datasets={datasets}
                        activeYear={activeYear}
                        activeName={activeName}
                        isInitGroup={initValue === groupData.group.id}
                    />
                </div>
            </div>


            {initValue !== groupData.group.id && (
                <div className="px-3 ml-auto mt-auto">
                    <div className="flex flex-row items-center gap-2">
                        

                        {(() => {
                            const firstWithCoords = locations.find(
                                (loc: any) => loc?.location?.coordinates?.length >= 2
                            );

                            if (!firstWithCoords) {
                                return (
                                    <span className="text-sm text-neutral-600 px-2 whitespace-nowrap">
                                        Utan koordinat
                                    </span>
                                );
                            }

                            const [lng, lat] = firstWithCoords.location.coordinates;

                            return (
                                <ClickableIcon
                                    label="Gå til koordinat"
                                    onClick={() => {
                                        mapFunctionRef.current?.flyTo(
                                            [lat, lng],
                                            15,
                                            { duration: 0.25, maxZoom: 18, padding: [50, 50] }
                                        );
                                    }}
                                    className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100"
                                >
                                    <PiMapPin aria-hidden="true" className="text-2xl" />
                                </ClickableIcon>
                            );
                        })()}

                        <ClickableIcon
                            label="Vel namnegruppe"
                            onClick={() => {
                                // Ensure details panel scrolls to top when selecting ("Vel") a new init group.
                                // The subsequent URL param update can remount components quickly, so do this eagerly.
                                if (scrollableContentRef.current) {
                                    scrollableContentRef.current.scrollTo({
                                        top: 0,
                                        behavior: 'auto'
                                    })
                                }
                                // Fit bounds to group sources when coordinates are available
                                if (locations.some((loc: any) => loc?.location?.coordinates)) {
                                    fitBoundsToGroupSources(mapFunctionRef.current, groupData);
                                }
                            }}
                            remove={['group', 'activePoint', 'activeYear', 'activeName']}
                            add={{
                                // When pinning a group ("vel"), treat it as a fresh init selection:
                                // reset results to 1 so previous expansions are not preserved.
                                init: stringToBase64Url(groupData.group.id),
                                maxResults: '1'
                            }}
                            className="btn btn-neutral inline-flex items-center justify-center w-12 h-12 rounded-full text-xl"
                        >
                            <PiPushPin aria-hidden="true" className="text-2xl" />
                        </ClickableIcon>
                    </div>
                </div>
            )}

        </div>
    );
}
