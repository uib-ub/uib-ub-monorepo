import Spinner from "@/components/svg/Spinner";
import Clickable from "@/components/ui/clickable/clickable";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import { datasetTitles } from "@/config/metadata-config";
import { defaultMaxResultsParam } from "@/config/max-results";
import { fitBoundsToGroupSources } from "@/lib/map-utils";
import { useGroup } from "@/lib/param-hooks";
import { stringToBase64Url } from "@/lib/param-utils";
import useGroupData from "@/state/hooks/group-data";
import { GlobalContext } from "@/state/providers/global-provider";
import { useSessionStore } from "@/state/zustand/session-store";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useMemo, type ReactNode } from "react";
import { PiAnchor, PiAnchorSimple, PiArchive, PiCaretLeftBold, PiCaretRightBold, PiCheck, PiMapPin, PiMapTrifold, PiPushPin, PiX } from "react-icons/pi";
import { detailsRenderer } from "@/lib/text-utils";
import Carousel from "../../nav/results/carousel";
import { TextTab } from "./text-tab";
import { NamesSection } from "./names-section";
import { FilteredSourcesTab } from "./sources-tab";
import { matchesActiveYear, matchesActiveName, pushNameYear } from "./group-utils";

export default function GroupInfo({
    id,
    overrideGroupCode,
    distanceMeters,
}: {
    id: string;
    overrideGroupCode?: string;
    distanceMeters?: number | null;
}) {
    const { groupData, groupLoading } = useGroupData(overrideGroupCode)
    const snappedPosition = useSessionStore(state => state.snappedPosition)
    const setSnappedPosition = useSessionStore(state => state.setSnappedPosition)
    const searchParams = useSearchParams()
    const searchDatasets = searchParams.getAll('dataset')
    const { mapFunctionRef, scrollableContentRef, isMobile } = useContext(GlobalContext)
    const { initValue, activeGroupValue } = useGroup()
    const activePoint = searchParams.get('activePoint')
    const coordinateInfo = searchParams.get('coordinateInfo') == 'on'
    const labelFilter = searchParams.get('labelFilter') === 'on'
    const noGrouping = searchParams.get('noGrouping') === 'on'
    const isInit = initValue == groupData?.group?.id || initValue == groupData?.fields?.["uuid"]?.[0]

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
    const groupLabel = groupData?.fields?.label?.[0]

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

    const { iiifItems, textItems, audioItems, datasets, uniqueCoordinates } = useMemo(() => {
        const iiifItems: any[] = []
        const textItems: any[] = []
        const audioItems: any[] = []
        const allCoordinates: any[] = []
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
                allCoordinates.push(source)
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


        return { iiifItems, textItems, audioItems, datasets, uniqueCoordinates: Array.from(coordSet) }
    }, [groupData, searchDatasets])

    const markerCoords = groupData?.fields?.location?.[0]?.coordinates
    const groupMarkerPosition: [number, number] | null =
        (Array.isArray(markerCoords) && markerCoords.length >= 2)
            ? (() => {
                const lat = Number(markerCoords[1])
                const lng = Number(markerCoords[0])
                return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null
            })()
            : null
    // Match the marker position after selecting this group ("Forankre namnegruppe").
    // The new accent marker should be the group's marker coordinate.
    const preferredFlyTarget: [number, number] | null = groupMarkerPosition

    const showNamesTab = useMemo(() => {
        // Replicate NamesTab's filter determinism: timeline or names without year
        const totalSources = Object.values(datasets).reduce((sum, sources) => sum + sources.length, 0)
        if (totalSources < 6) {
            return false
        }
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

        // Don't show if the number of unique labels or the number of years is the same as the number of sources
        if (totalUniqueNames === totalSources) {
            return false
        }
        if (totalYears === totalSources) {
            return false
        }


        

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
            //return showNamesTab // Show if there are multiple names/years to filter by
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
            //return false
        }

        return showNamesTab
    }, [datasets, activeYear, activeName, showNamesTab])




    if (groupLoading) return (
        <div className="flex justify-center items-center w-full py-8">
            <Spinner status="Laster" className="animate-spin rounded-full h-8 w-8"></Spinner>
        </div>
    )

    if (!groupData?.group?.id) {
        console.log("Group ID not found")
        const props = {
            message: `Group ID not found: ${JSON.stringify(groupData)}}`
        }

        fetch('/api/error', {
            method: 'POST',
            body: JSON.stringify(props)
        })
        return <div className="p-2">Kunne ikkje lasta inn gruppe {JSON.stringify(groupData)} {overrideGroupCode}</div>
    }


    return (
        <div id={id} className="relative flex min-w-0 flex-wrap items-center pb-4">
            {noGrouping && (
                <div className="min-w-0 px-3 w-full">
                    <FilteredSourcesTab
                        datasets={datasets}
                        activeYear={activeYear}
                        activeName={activeName}
                        isInitGroup={activeGroupValue === groupData.group.id}
                        distanceMeters={distanceMeters}
                    />
                </div>
            )}

            {
                audioItems?.map((audioItem) => (
                    <div key={audioItem.uuid + 'audio'}>
                        {audioItem.recordings.map((recording: any, index: number) => (
                            <div key={"audio-" + recording.uuid} className="flex items-center p-2">
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
            {iiifItems?.length > 0 && !coordinateInfo && <>
                <Carousel items={iiifItems} />
            </>
            }
            {textItems.length > 0 && !coordinateInfo && <TextTab textItems={textItems} />}

            <div className="min-w-0 w-full flex flex-col">
                {/* Filtering / coordinate sticky headers */}
                {labelFilter && !coordinateInfo && (
                    <div className="sticky top-0 z-10 w-full shrink-0 border-b border-neutral-100 bg-white px-3 pt-2 pb-2">
                        <div className="flex min-w-0 items-center justify-between gap-3 gap-y-2">
                            <div className="min-w-0 flex-1 flex items-center gap-2 text-base text-neutral-900">
                                <span className="font-semibold truncate">
                                    {groupLabel}
                                </span>
                                <span className="truncate text-neutral-900">
                                    {detailsRenderer(groupData)}
                                </span>
                            </div>
                            <Clickable
                                remove={['labelFilter', 'activeName', 'activeYear']}
                                aria-label="Tilbake"
                                className="inline-flex shrink-0 items-center gap-1.5 text-neutral-800 hover:text-neutral-900"
                            >
                                <PiCaretLeftBold className="text-base shrink-0" aria-hidden="true" />
                                <span className="whitespace-nowrap">Tilbake</span>
                            </Clickable>
                        </div>
                    </div>
                )}

                {coordinateInfo && (
                    <div className="w-full shrink-0 border-b border-neutral-100 bg-white px-3 py-3">
                        <div className="flex flex-col min-w-0 gap-y-3">
                            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
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
                                            <span className="min-w-0 flex-1 truncate text-base text-neutral-900" title={coordText}>
                                                {coordText}
                                            </span>
                                            {total > 1 && <div className="flex shrink-0 items-center gap-1.5">
                                                <NavBtn label="Førre koordinat" targetIndex={Math.max(0, activeIndex - 1)} disabled={activeIndex === 0}>
                                                    <PiCaretLeftBold aria-hidden="true" />
                                                </NavBtn>
                                                <span className="text-neutral-700 text-sm tabular-nums text-center px-2" aria-hidden="true">
                                                    {activeIndex + 1} av {total}
                                                </span>
                                                <NavBtn label="Neste koordinat" targetIndex={Math.min(total - 1, activeIndex + 1)} disabled={activeIndex === total - 1}>
                                                    <PiCaretRightBold aria-hidden="true" />
                                                </NavBtn>
                                            </div>}
                                        </>
                                    )
                                })()}
                            </div>
                        </div>
                    </div>
                )}

                {/* Names section (includes timeline) - show for all eligible groups, hide only in coordinate view */}
                {shouldShowLabelFilter && !coordinateInfo && (
                    <div className={`px-3 ${initValue === groupData.group.id ? 'pt-2' : 'pt-6'}`}>
                        <NamesSection
                            datasets={datasets}
                            groupCode={stringToBase64Url(groupData.group.id)}
                        />
                    </div>
                )}

                {/* min-w-0 so width is constrained by panel, not by expanded content */}
                {!noGrouping && (
                    <div className="min-w-0 px-3">
                        <FilteredSourcesTab
                            datasets={datasets}
                            activeYear={activeYear}
                            activeName={activeName}
                            isInitGroup={activeGroupValue === groupData.group.id}
                        />
                    </div>
                )}
            </div>


            {!coordinateInfo && !labelFilter && !noGrouping && <div className="px-3 ml-auto mt-auto">
                <div className="flex flex-row items-center gap-2">
                        

                        {!preferredFlyTarget ? 
                                    <span className="text-sm text-neutral-700 px-2 whitespace-nowrap">
                                        Utan koordinat
                                    </span>
                                :

                            <ClickableIcon
                                    label="Kartfesting"
                                    onClick={() => {
                                        mapFunctionRef.current?.flyTo(
                                            preferredFlyTarget,
                                            15,
                                            { duration: 0.25, maxZoom: 18, padding: [50, 50] }
                                        );
                                        if (isMobile && snappedPosition !== 'bottom') {
                                            setSnappedPosition('bottom');
                                        }
                                    }}
                                    remove={['group', 'activePoint']}
                                    add={{ group: initValue == activeGroupValue ? null : stringToBase64Url(groupData.group.id), activePoint: preferredFlyTarget?.toString(), coordinateInfo: 'on' }}
                                    className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-neutral-300 btn btn-outline"
                                >
                                    <PiMapTrifold aria-hidden="true" className="text-2xl text-neutral-800" />

                                </ClickableIcon>
                                }

                            <ClickableIcon
                                label={`${isInit ? "Fjern som startpunkt" : "Vel som startpunkt"}`}
                                onClick={() => {
                                    // Ensure details panel scrolls to top when selecting ("Vel") a new init group.
                                    // The subsequent URL param update can remount components quickly, so do this eagerly.
                                    if (preferredFlyTarget) {
                                        mapFunctionRef.current?.flyTo(preferredFlyTarget, 15, { duration: 0.25, maxZoom: 18, padding: [50, 50] });
                                    }
                                    
                                }}
                                remove={['group', 'point', 'activePoint', 'activeYear', 'activeName']}
                                add={{
                                    // When pinning a group ("vel"), treat it as a fresh init selection.
                                    q: searchParams.get('q') ? groupData.fields.label[0] : null,
                                    init: isInit ? null : noGrouping ? groupData.fields["uuid"][0] : stringToBase64Url(groupData.group.id),
                                    point: (!isInit && preferredFlyTarget) ? `${preferredFlyTarget?.[0]},${preferredFlyTarget?.[1]}` : null,
                                    maxResults: defaultMaxResultsParam
                                }}
                                className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-neutral-300 btn btn-outline"
                            >
                                {isInit ? <PiX aria-hidden="true" className="text-2xl text-neutral-800" /> : <PiCheck aria-hidden="true" className="text-2xl text-neutral-800" />}
                            </ClickableIcon>
                        
                    </div>
                </div>}

        </div>
    );
}
