import Spinner from "@/components/svg/Spinner";
import AudioPlayerList from "@/components/audio/audio-player-list";
import Clickable from "@/components/ui/clickable/clickable";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import { defaultMaxResultsParam } from "@/config/max-results";
import { fitBoundsToGroupSources } from "@/lib/map-utils";
import { useGroup } from "@/lib/param-hooks";
import { stringToBase64Url } from "@/lib/param-utils";
import useGroupData from "@/state/hooks/group-data";
import { GlobalContext } from "@/state/providers/global-provider";
import { useSessionStore } from "@/state/zustand/session-store";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import { PiAnchor, PiAnchorSimple, PiCaretLeftBold, PiCaretRightBold, PiCheck, PiGps, PiMapPin, PiMapPinFill, PiMapTrifold, PiPerson, PiPushPin, PiX } from "react-icons/pi";
import { detailsRenderer } from "@/lib/text-utils";
import { getValueByPath } from "@/lib/utils";
import Carousel from "../../nav/results/carousel";
import DocInfo from "../doc/doc-info";
import { TextTab } from "./text-tab";
import { GroupFilters } from "./names-section";
import { FilteredChildSources } from "./filtered-child-sources";
import { matchesActiveYear, matchesActiveName, pushNameYear } from "./group-utils";
import { DatasetSummary } from "../../dataset-summary";

export default function GroupInfo({
    id,
    overrideGroupCode,
    docData,
}: {
    id: string;
    overrideGroupCode?: string;
    docData?: Record<string, any>;
}) {
    const { groupData, groupLoading, groupTotal } = useGroupData(overrideGroupCode)
    const iiifItems = groupData?.iiifItems
    const textItems = groupData?.textItems
    const audioItems = groupData?.audioItems
    const datasets = groupData?.datasets
    const uniqueCoordinates = groupData?.uniqueCoordinates
    const searchParams = useSearchParams()
    const { initValue } = useGroup()
    const scrollableContentRef = useRef<HTMLDivElement>(null)
    const { mapFunctionRef, isMobile } = useContext(GlobalContext)
    const sourceView = searchParams.get('sourceView') === 'on'
    const snappedPosition = useSessionStore((s) => s.snappedPosition)
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition)
    const activePoint = searchParams.get('activePoint')


    const activeGroupValue = groupData?.group?.id

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
        if (groupData?.group?.id && initValue === groupData.id && scrollableContentRef.current) {
            requestAnimationFrame(() => {
                scrollableContentRef.current?.scrollTo({
                    top: 0,
                    behavior: 'auto'
                });
            });
        }
    }, [initValue, groupData?.group?.id, scrollableContentRef]);





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




    if (!sourceView) {
        if (groupLoading) return (
            <div className="flex justify-center items-center w-full py-8">
                <Spinner status="Laster" className="animate-spin rounded-full h-8 w-8"></Spinner>
            </div>
        )

        if (!groupData?.["id"]) {
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
    }

    if (sourceView) {
        return <DocInfo id={id} docData={docData} />
    }


    return (
        <div id={id} className="relative flex min-w-0 flex-wrap items-center pb-4 pt-2 gap-3">
            {iiifItems?.length > 0 && <>
                    <Carousel items={iiifItems} />
                </>
                }


                {
                    audioItems?.map((audioItem: any) => (
                        <AudioPlayerList
                            key={audioItem.uuid + "audio"}
                            recordings={Array.isArray(audioItem.recordings) ? audioItem.recordings : []}
                            showArchiveLink
                        />
                    ))
                }
                
                {textItems.length > 0 && <TextTab textItems={textItems} />}

            

            {(false) && <div className="min-w-0 w-full flex flex-col">
                {/* Filtering / coordinate sticky headers */}
                {false && false && (
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

                {false && (
                    <div className="w-full shrink-0 border-b border-neutral-100 bg-white px-3 py-3">
                        <div className="flex flex-col min-w-0 gap-y-3">
                            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
                                {(() => {
                                    const total = uniqueCoordinates.length
                                    const activeIndexRaw = uniqueCoordinates.findIndex((c: string) => c === activePoint)
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

            </div>}
            <div className="px-3 text-neutral-900">
                <DatasetSummary datasetKeys={datasets} />
            </div>


            {!sourceView && <div className="px-3 ml-auto mt-auto">
                <div className="flex flex-row items-center gap-2">


                    {!preferredFlyTarget ?
                        <span className="text-sm text-neutral-700 px-2 whitespace-nowrap">
                            Utan koordinat
                        </span>
                        :

                        <ClickableIcon
                            label="Gå til koordinat"
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
                            add={{ group: initValue == activeGroupValue ? null : stringToBase64Url(groupData.id), activePoint: preferredFlyTarget?.toString() }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-neutral-300 btn btn-outline"
                        >
                            <PiMapPinFill aria-hidden="true" className="text-xl text-neutral-800" />

                        </ClickableIcon>
                    }

                    
                    {groupTotal > 0 && <Clickable className="btn btn-outline btn-compact rounded-full items-center gap-1 pr-2" add={{ activePoint: preferredFlyTarget?.toString() || null, sourceView: 'on', group: stringToBase64Url(groupData.id) }}>
                    {groupTotal} oppslag<PiCaretRightBold aria-hidden="true" className="text-primary-700" />
                </Clickable>}

                </div>
            </div>}

        </div>
    );
}
