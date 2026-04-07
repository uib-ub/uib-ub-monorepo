'use client'
import { MAP_DRAWER_BOTTOM_HEIGHT_REM, MAP_DRAWER_MAX_HEIGHT_SVH, panPointIntoView } from "@/lib/map-utils";
import { useDebugGroupsOn, useDebugParamOn, useFacetParam, useGroupParam, useHideResultsOn, useInitParam, useMapSettingsOn, useMode, useOptionsOn, useOverlayParams, useOverlaySelectorOn, usePerspective, useQParam, useSourceViewOn, useTreeParam } from "@/lib/param-hooks";
import { useSearchQuery } from "@/lib/search-params";
import useResultCardData from "@/state/hooks/result-card-data";
import useSearchData from "@/state/hooks/search-data";
import { GlobalContext } from "@/state/providers/global-provider";
import { useSessionStore } from "@/state/zustand/session-store";
import { useDebugStore } from "@/state/zustand/debug-store";
import dynamic from "next/dynamic";
import { useContext, useEffect, useRef, useState } from "react";
import { PiCaretDownBold, PiCaretLeftBold, PiCaretUp, PiCaretUpBold, PiX } from "react-icons/pi";
import { overlayButtonShadowClass, RoundIconButton } from "@/components/ui/clickable/round-icon-button";
import MapSettings from "@/components/map/map-settings";
import { Badge, TitleBadge } from "@/components/ui/badge";
import Clickable from "@/components/ui/clickable/clickable";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import FacetSection from "@/components/facets/facet-section";
import GroupedResultsToggle from "@/components/results/grouped-results-toggle";
import SearchResults from "@/components/results/search-results";
import NamesSection from "@/components/results/names-section";
import { fieldConfig } from "@/config/search-config";
import Spinner from "@/components/svg/Spinner";
import ClientFacet from "@/components/facets/client-facet";
import DatasetFacet from "@/components/facets/dataset-facet";
import ServerFacet from "@/components/facets/server-facet";
import WikiAdmFacet from "@/components/facets/wikiAdm-facet";
import DebugToggle from "@/components/results/debug-toggle";
import TableOptions from "@/components/table/table-options";
import TreeWindow from "@/components/tree/tree-window";
import { twMerge } from "tailwind-merge";
import ResultsHeader from "@/components/results/results-header";

const Drawer = dynamic(() => import("@/components/ui/drawer"), {
    ssr: false
});

export interface DrawerProps {
    children: React.ReactNode
    drawerOpen: boolean
    dismissable: boolean
    setDrawerOpen: (open: boolean) => void
    snappedPosition: 'bottom' | 'middle' | 'top'
    setSnappedPosition: (position: 'bottom' | 'middle' | 'top') => void
    currentPosition: number
    setCurrentPosition: (position: number) => void
    bottomHeightRem?: number
    middleHeightSvh?: number,
    scrollContainerRef?: React.RefObject<HTMLDivElement | null>,
    resultCardData?: any
}

function ShowResultsButton() {
    const { totalHits } = useSearchData()
    const { snappedPosition } = useSessionStore()
    const mode = useMode()
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition)
    if (snappedPosition == 'bottom') return null
    return <div className="p-3 fixed bottom-2 left-0 right-0 z-[3001]">
        <Clickable remove={["facet", "options"]}
            // results: integer – minimum is 5 and controls expanded results.
            onClick={() => mode == 'table' ? setSnappedPosition('bottom') : null}
            className={twMerge("w-full h-12 btn text-xl relative rounded-full btn btn-primary", overlayButtonShadowClass)}>

            Vis resultat <Badge className="bg-primary-50 text-primary-800 font-semibold px-2 absolute right-4" count={totalHits?.value || 0} /></Clickable></div>

}



function DrawerWrapper({ children, resultCardData, ...rest }: DrawerProps) {
    const { isMobile, mapFunctionRef } = useContext(GlobalContext)
    const snappedPosition = useSessionStore((s) => s.snappedPosition);
    const resetEnabled = useRef<boolean>(false);
    const facet = useFacetParam()
    const mapSettingsOn = useMapSettingsOn()
    const overlaySelectorOn = useOverlaySelectorOn()
    const mode = useMode()

    useEffect(() => {
        if (!isMobile || mode == 'table' || !mapFunctionRef?.current) return
        // When map settings or the overlay selector are open, avoid auto-panning the map
        // so that explicit map interactions (like fitting to an overlay) are not overridden
        // when the drawer position changes.
        if (mapSettingsOn || overlaySelectorOn) return
        const point = resultCardData?.coordinates
        if (!point) return

        const wasAdjusted = panPointIntoView(mapFunctionRef.current, [point[1], point[0]], true, snappedPosition === 'middle', resetEnabled.current)
        if (wasAdjusted) {
            resetEnabled.current = !resetEnabled.current
        }

    }, [isMobile, snappedPosition, resultCardData, mapFunctionRef, mode, mapSettingsOn, overlaySelectorOn])

    if (!isMobile) {
        return <>{children}</>
    }

    if (isMobile && (facet || (mapSettingsOn && overlaySelectorOn))) {
        return (
            <div className="fixed top-0 left-0 w-full h-full z-[10001] bg-white">
                <div className="h-[100svh] overflow-y-auto stable-scrollbar">
                    {children}
                </div>
            </div>
        )
    }
    return <Drawer {...rest} bottomHeightRem={MAP_DRAWER_BOTTOM_HEIGHT_REM} middleHeightSvh={MAP_DRAWER_MAX_HEIGHT_SVH}>{children}</Drawer>
}

function LeftWindow({ children, bottomContent }: { children: React.ReactNode, bottomContent?: React.ReactNode }) {
    const { isMobile } = useContext(GlobalContext)
    const mapSettingsOn = useMapSettingsOn()
    const hideResultsOn = useHideResultsOn()
    const optionsOn = useOptionsOn()
    if (isMobile) {
        if (mapSettingsOn && hideResultsOn) return null
        return <>{children}</>
    }
    return (
        <div className={`${optionsOn ? '' : 'invisible lg:visible'} pointer-events-none absolute left-2 bottom-2 right-2 top-[4rem] z-[3001] w-full lg:w-[calc(30svw-1rem)] xl:w-[calc(25svw-1rem)] top-[50svh] lg:top-16 flex flex-col items-start gap-2 max-h-[calc(100svh-4.5rem)]`}>
            <section className="pointer-events-auto bg-white shadow-lg flex flex-col w-full rounded-md overflow-y-scroll min-h-0"
                aria-label="Søkefilter">{children}</section>
            {bottomContent ? <div className="pointer-events-auto">{bottomContent}</div> : null}
        </div>
    )
}

function RightWindow({ children }: { children: React.ReactNode }) {
    const { isMobile, scrollableContentRef } = useContext(GlobalContext)
    const tree = useTreeParam()
    const optionsOn = useOptionsOn()
    const hideResultsOn = useHideResultsOn()


    const [showScrollToTop, setShowScrollToTop] = useState(false)

    useEffect(() => {
        const el = scrollableContentRef?.current
        if (!el || isMobile) return

        const onScroll = () => {
            setShowScrollToTop(el.scrollTop > 300)
        }

        el.addEventListener('scroll', onScroll, { passive: true })
        onScroll()

        return () => {
            el.removeEventListener('scroll', onScroll)
        }
    }, [scrollableContentRef, isMobile])

    const scrollToTop = () => {
        scrollableContentRef?.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (isMobile) {
        return <>{children}</>
    }
    return <div className={`pointer-events-none absolute lg:top-2 right-2 bottom-2 ${hideResultsOn ? 'top-[calc(100svh-2.5rem)]' : 'top-1/2 '} w-[calc(100svw-1rem)] ${optionsOn ? 'invisible lg:visible' : ''} lg:w-[40svw] ${tree ? '' : 'xl:w-[25svw]'} z-[3001] max-h-[calc(100svh-2rem)]`}>
        <section ref={scrollableContentRef} className={`pointer-events-auto bg-white shadow-lg rounded-md ${isMobile ? 'hidden-scrollbar' : ''} overflow-y-auto max-h-[50svh] lg:max-h-[calc(100svh-2rem)]`}
            aria-labelledby="right-title">
            <div className={`flex flex-col ${showScrollToTop ? 'pb-20' : ''}`}>
                {children}
            </div>
        </section>
        {showScrollToTop && (
            <RoundIconButton
                type="button"
                className="pointer-events-auto absolute right-3 bottom-3 z-10 p-3"
                onClick={scrollToTop}
                label="Til toppen"
                side="top"
            >
                <PiCaretUp className="text-2xl" />
            </RoundIconButton>
        )}
    </div>
}

export default function MapInterface() {
    const snappedPosition = useSessionStore((s) => s.snappedPosition);
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition);
    const currentPosition = useSessionStore((s) => s.currentPosition);
    const setCurrentPosition = useSessionStore((s) => s.setCurrentPosition);
    const setDrawerOpen = useSessionStore((s) => s.setDrawerOpen);
    const { isMobile, scrollableContentRef } = useContext(GlobalContext)
    const { resultCardData } = useResultCardData()
    const sourceView = useSourceViewOn()

    const drawerRef = useRef<HTMLDivElement>(null)

    const { showLeftPanel, showRightPanel, optionsOn, mapSettingsOn, overlaySelectorOn, facet, tableOptions } = useOverlayParams()
    const { facetFilters, datasetFilters } = useSearchQuery()
    const filterCount = facetFilters.length + datasetFilters.length
    // Count the number of unique facets (keys) that have active filters, including the dataset facet
    const facetCount = new Set([
        ...facetFilters.map(([key]) => key),
        ...datasetFilters.map(([key]) => key),
    ]).size
    const perspective = usePerspective()
    const setDebug = useDebugStore((s) => s.setDebug)
    const debugOn = useDebugParamOn()
    const showDebugGroupsOn = useDebugGroupsOn()
    const hideResultsOn = useHideResultsOn()
    const tree = useTreeParam()
    const mode = useMode()
    const init = useInitParam()
    const group = useGroupParam()

    useEffect(() => {
        if (debugOn) {
            setDebug(true)
        }

    }, [debugOn, setDebug])

    const isDesktopMap = !isMobile && mode !== 'table'

    const desktopMapButtons = isDesktopMap && sourceView && !optionsOn && !facet && !tree ? (
        <div className="flex gap-2">
            {facetCount > 1 && (
                <Clickable
                    className="btn btn-neutral btn-sm"
                    remove={[...facetFilters.map(([key]) => key), ...datasetFilters.map(([key]) => key)]}
                >
                    Tøm
                </Clickable>
            )}
            <Clickable className="btn btn-primary btn-sm" add={{ options: 'on' }}>
                Alle filter
            </Clickable>
        </div>
    ) : undefined

    return <>

        <div ref={drawerRef} className="scroll-container">
            <DrawerWrapper
                drawerOpen={true}
                resultCardData={resultCardData}
                dismissable={false}
                setDrawerOpen={setDrawerOpen}
                snappedPosition={snappedPosition}
                setSnappedPosition={setSnappedPosition}
                currentPosition={currentPosition}
                setCurrentPosition={setCurrentPosition}
                scrollContainerRef={scrollableContentRef}
            >
                {showLeftPanel && <LeftWindow bottomContent={desktopMapButtons}>

                    {tableOptions && (
                        <TableOptions />
                    )}

                    {!tableOptions && facet && (
                        <div className="w-full flex items-center px-2 py-1 xl:px-0 gap-2 xl:pl-2 xl:py-2">
                            <div id={isMobile ? 'drawer-title' : 'left-title'} className="text-lg text-neutral-900 px-1 font-semibold">
                                {fieldConfig[perspective][facet]?.label}
                            </div>
                            <div className="flex items-center gap-1 ml-auto">
                                <Clickable className="flex items-center gap-1 px-2" label="Tilbake" remove={["facet"]}>
                                    <PiCaretLeftBold className="text-black text-lg" />
                                    Tilbake
                                </Clickable>
                            </div>
                        </div>
                    )}

                    {!tableOptions && !facet && (sourceView || mode == 'table') && (
                        <>
                            {optionsOn &&
                                (isMobile ? (
                                    <span id="drawer-title" className="sr-only">
                                        Filter
                                    </span>
                                ) : (
                                    <div className="w-full flex items-center px-2 py-1 xl:px-0 gap-2 xl:pl-2 xl:py-2">
                                        <div className="flex items-center gap-1 xl:px-1 w-full">
                                            <div id="left-title" className="text-base xl:text-lg text-neutral-900 font-sans font-semibold">
                                                Filter
                                            </div>
                                            {filterCount ? (
                                                <TitleBadge className="bg-accent-100 text-accent-900 text-sm xl:text-base" count={filterCount} />
                                            ) : null}
                                            <ClickableIcon className="ml-auto" label="Lukk" remove={["options"]}>
                                                <PiX className="text-black text-3xl" />
                                            </ClickableIcon>
                                        </div>
                                    </div>
                                ))}

                            <div id="options-panel" className="flex flex-col divide-y divide-neutral-200">
                                {group && <NamesSection />}
                                <FacetSection />
                                {isMobile && <ShowResultsButton />}
                            </div>
                        </>
                    )}

                    {facet && <div className="flex flex-col gap-2 pb-20">
                        {facet == 'adm' ? (
                            <ClientFacet facetName={facet} />
                        ) : facet == 'wikiAdm' ? (
                            <WikiAdmFacet />
                        ) : facet == 'dataset' ? (
                            <DatasetFacet />
                        ) : (
                            <ServerFacet />
                        )}
                        {isMobile && <ShowResultsButton />}
                    </div>}
                </LeftWindow>}



                {showRightPanel && <RightWindow>
                    {/* Map settings should be available even when tree view is active */}
                    {mapSettingsOn ? (
                        <>
                            <div
                                id="map-settings-panel"
                                className="w-full sticky flex flex-wrap items-center bg-neutral-50 py-2 px-2 xl:gap-y-3 gap-2 text-neutral-950 min-w-0 overflow-hidden border-b border-neutral-200"
                            >
                                <div className="w-full flex">
                                    <div className="relative flex items-center gap-2 xl:px-1 w-full">
                                        <div id={isMobile ? 'drawer-title' : 'right-title'} className="text-sm xl:text-lg text-neutral-900 font-sans pr-10 font-semibold">
                                            {overlaySelectorOn ? 'Kartlag' : 'Kartinnstillingar'}
                                        </div>

                                        {overlaySelectorOn ? (
                                            <div className="ml-auto">
                                                <Clickable className="flex items-center gap-2" label="Tilbake" remove={["overlaySelector"]}>
                                                    <PiCaretLeftBold className="text-primary-700" />
                                                    Tilbake
                                                </Clickable>
                                            </div>
                                        ) : (
                                            <ClickableIcon
                                                label="Lukk"
                                                className="absolute right-0 inset-y-0 flex items-center justify-center"
                                                remove={["mapSettings", "overlaySelector"]}
                                            >
                                                <PiX className="text-neutral-800 text-3xl lg:text-2xl" aria-hidden="true" />
                                            </ClickableIcon>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <MapSettings />
                        </>
                    ) : tree ? (
                        <TreeWindow />
                    ) : (
                        <>
                            
                            { (
                                <div
                                    id="results-panel"
                                    className={!isMobile ? "flex-1 min-h-0" : ""}
                                >
                                    {showDebugGroupsOn ? <DebugToggle /> : <SearchResults />}
                                </div>
                            )}
                        </>
                    )}
                </RightWindow>}
            </DrawerWrapper>


        </div>
    </>

}