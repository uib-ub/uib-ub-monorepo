'use client'

import { PiBookOpen, PiCaretDown, PiCaretDownBold, PiCaretLeftBold, PiCaretUpBold, PiCrop, PiEye, PiEyeSlash, PiFunnel, PiInfoFill, PiListBullets, PiMapPin, PiSliders, PiTableFill, PiX } from "react-icons/pi";
import { RoundClickable } from "../ui/clickable/round-icon-button";
import dynamic from "next/dynamic";
import { formatNumber } from "@/lib/utils";
import SearchResults from "./nav/results/search-results";
import MapSettings from "../map/map-settings";
import { useSessionStore } from "@/state/zustand/session-store";
import { useContext, useEffect, useRef, useState } from "react";
import useGroupData from "@/state/hooks/group-data";
import { useSearchQuery } from "@/lib/search-params";
import { GlobalContext } from "@/state/providers/global-provider";
import useSearchData from "@/state/hooks/search-data";
import { useSearchParams } from "next/navigation";
import OptionsWindow from "./nav/options-window";
import Clickable from "../ui/clickable/clickable";
import { MAP_DRAWER_BOTTOM_HEIGHT_REM, MAP_DRAWER_MAX_HEIGHT_SVH, panPointIntoView } from "@/lib/map-utils";
import ClickableIcon from "../ui/clickable/clickable-icon";
import { Badge, TitleBadge } from "../ui/badge";
import { useGroup, useMode, usePerspective } from "@/lib/param-hooks";
import FacetSection from "./nav/facets/facet-section";
import ActiveFilters from "./form/active-filters";
import ServerFacet from "./nav/facets/server-facet";
import ClientFacet from "./nav/facets/client-facet";
import WikiAdmFacet from "./nav/facets/wikiAdm-facet";
import { facetConfig, fieldConfig } from "@/config/search-config";
import DatasetFacet from "./nav/facets/dataset-facet";
import TableOptions from "./table/table-options";
import { useDebugStore } from "@/state/zustand/debug-store";
import DebugToggle from "./nav/results/debug-toggle";
import SearchQueryDisplay from "./nav/results/search-query-display";
import { datasetTitles } from "@/config/metadata-config";




const Drawer = dynamic(() => import("../ui/drawer"), {
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
    scrollContainerRef?: React.RefObject<HTMLDivElement>,
    groupData?: any
}

function ShowResultsButton() {
    const { totalHits } = useSearchData()
    const { snappedPosition } = useSessionStore()
    const mode = useMode()
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition)
    if (snappedPosition == 'bottom') return null
    return <div className="p-2 fixed bottom-2 left-0 right-0">
        <Clickable remove={["facet"]} 
                   add={{results: 'on'}} 
                   onClick={() => mode == 'table' ? setSnappedPosition('bottom') : null}
                   className="w-full h-12 btn text-xl relative rounded-full">
                    Vis resultat <Badge className="bg-primary-50 text-neutral-800 font-semibold px-2 absolute right-4" count={totalHits?.value || 0} /></Clickable></div>

}

function DrawerWrapper({ children, groupData, ...rest }: DrawerProps) {
    const { isMobile, mapFunctionRef } = useContext(GlobalContext)
    const snappedPosition = useSessionStore((s) => s.snappedPosition);
    const resetEnabled = useRef<boolean>(false);
    const facet = useSearchParams().get('facet')
    
    const mode = useMode()

    useEffect(() => {
        if (!isMobile || mode == 'table' || !mapFunctionRef?.current) return
        const point = groupData?.sources?.[0]?.location?.coordinates
        if (!point) return

        const wasAdjusted = panPointIntoView(mapFunctionRef.current, [point[1], point[0]], true, snappedPosition === 'middle', resetEnabled.current)
        if (wasAdjusted) {
            resetEnabled.current = !resetEnabled.current
        }
        
    }, [isMobile, snappedPosition, groupData, mapFunctionRef, mode])

    if (!isMobile) {
        return <>{children}</>
    }
    
    if (isMobile && facet) {
        return <div className="fixed top-0 left-0 w-full h-full z-[10001] bg-white"><div className="h-[100vh] overflow-y-auto stable-scrollbar">{children}</div>
        </div>
    }
    if (mode == 'list') {
        return <div className="bg-white absolute top-14 left-0 right-0 h-[calc(100svh-3.5rem)] z-[3001] overflow-y-auto stable-scrollbar">

            {children}
        </div>
    }
    return <Drawer {...rest} bottomHeightRem={MAP_DRAWER_BOTTOM_HEIGHT_REM} middleHeightSvh={MAP_DRAWER_MAX_HEIGHT_SVH}>{children}</Drawer>
}

function LeftWindow({children}: {children: React.ReactNode}) {
    const { isMobile } = useContext(GlobalContext)
    const searchParams = useSearchParams()
    const results = searchParams.get('results') == 'on'
    const mapSettings = searchParams.get('mapSettings') == 'on'
    if (isMobile) {
        if (mapSettings && results) return null
        return <>{children}</>
    }
    return <div className="bg-white shadow-lg flex flex-col absolute left-2 top-[4rem] w-[calc(25svw-1rem)] max-h-[calc(100svh-4.5rem)] z-[3001] rounded-md overflow-y-auto overflow-x-hidden stable-scrollbar">{children}</div>
}

function RightWindow({children}: {children: React.ReactNode}) {
    const { isMobile } = useContext(GlobalContext)
    const searchParams = useSearchParams()
    const results = searchParams.get('results') == 'on'
    const mapSettings = searchParams.get('mapSettings') == 'on'
    if (isMobile) {
        if (!mapSettings && !results) return null
        return <>{children}</>
    }
    return <div className="bg-white shadow-lg absolute right-0 top-[0.5rem] w-[25svw] max-h-[calc(100svh-4.5rem)] z-[3001] rounded-md overflow-y-auto overflow-x-hidden stable-scrollbar">{children}</div>
}

export default function OverlayInterface() {
    const snappedPosition = useSessionStore((s) => s.snappedPosition);
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition);
    const currentPosition = useSessionStore((s) => s.currentPosition);
    const setCurrentPosition = useSessionStore((s) => s.setCurrentPosition);
    const setDrawerOpen = useSessionStore((s) => s.setDrawerOpen);
    const { isMobile } = useContext(GlobalContext)
    const searchParams = useSearchParams()
    const { totalHits, searchBounds, searchLoading, searchError } = useSearchData()
    const { groupData } = useGroupData()

    const drawerRef = useRef<HTMLDivElement>(null)
    const scrollableContent = useRef<HTMLDivElement>(null);
    const results = searchParams.get('results') == 'on'
    const options = searchParams.get('options') == 'on'
    const mapSettings = searchParams.get('mapSettings') == 'on'
    const { facetFilters, datasetFilters } = useSearchQuery()
    const filterCount = facetFilters.length + datasetFilters.length
    const facet = searchParams.get('facet')
    const perspective = usePerspective()
    const mode = useMode()
    const tableOptions = searchParams.get('tableOptions') == 'on'
    const setDebug = useDebugStore((s) => s.setDebug)
    const debugParam = searchParams.get('debug')
    const showDebugGroups = searchParams.get('debugGroups') == 'on'

    useEffect(() => {
        if (debugParam == 'on') {
            setDebug(true)
        }
        
    }, [debugParam, setDebug])

    return <>



        <div ref={drawerRef}  className="scroll-container">
                <DrawerWrapper 
                    drawerOpen={true}
                    groupData={groupData}
                    dismissable={false}
                    setDrawerOpen={setDrawerOpen}
                    snappedPosition={snappedPosition}
                    setSnappedPosition={setSnappedPosition}
                    currentPosition={currentPosition}
                    setCurrentPosition={setCurrentPosition}
                    scrollContainerRef={scrollableContent}
                >
                    {(!isMobile || ( !results && !mapSettings) || mode == 'table') && <LeftWindow>  

                        {(tableOptions && <TableOptions />)



                        || (facet && <div className="w-full flex items-center px-2 py-1 xl:px-0 gap-2 xl:pl-2 xl:py-2 shrink-0">
                            <h1 className="text-lg text-neutral-900 px-1">{fieldConfig[perspective][facet]?.label}</h1>
                            <div className="flex items-center gap-1 ml-auto">
                                    <Clickable className="flex items-center gap-1 px-2" label="Tilbake" remove={["facet"]}>
                                        <PiCaretLeftBold className="text-black text-lg" />Tilbake
                                    </Clickable>
                                </div>
                            
                        </div>)
                        
                        || <div  className="w-full flex items-center px-2 py-1 xl:px-0 gap-2 xl:pl-2 xl:py-2 shrink-0">
                        <Clickable aria-expanded={options} aria-controls="options-panel" className="flex items-center gap-2 xl:px-1 w-full" add={{options: (options && !isMobile) ? null : 'on'}} remove={["options"]}>
                        
                        <h1 className="text-base xl:text-lg text-neutral-900 font-sans">Filter</h1>
                            
                            { filterCount ? <TitleBadge className="bg-accent-100 text-accent-900 text-sm xl:text-base" count={filterCount} /> : null}
                            {
                            !isMobile && <>
                                {options ? <PiCaretUpBold className="text-lg ml-auto" aria-hidden="true"/> : <PiCaretDownBold className="text-lg ml-auto" aria-hidden="true"/>}
                            </>
                        }
                            </Clickable>
                            <div className="flex items-center gap-1 ml-auto">
                        
                        {!totalHits?.value && isMobile && <span className="text-sm xl:text-bas px-2">Ingen resultat</span>}
                        </div>
                        
                            </div>}
                        {(options || isMobile) && !facet && <div id="options-panel" className="flex flex-col gap-2">
                       
                        
                        

                        



                               <FacetSection />{isMobile && <ShowResultsButton />}
                        </div>}
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
                    
                    {mode == 'map' && <RightWindow>
                        {/* Map Settings Header (separate, only when mapSettings is on) */}
                        {mapSettings ? (
                            <div className="w-full flex items-center xl:h-12 px-2 xl:px-0 gap-2">
                                <h1 className="text-base xl:text-lg text-neutral-900 xl:px-4">Kartinnstillingar</h1>
                                <div className="flex items-center gap-1 ml-auto">
                                    <ClickableIcon label="Lukk" className="p-2" remove={["mapSettings"]}>
                                        <PiX className="text-black text-3xl" />
                                    </ClickableIcon>
                                </div>
                            </div>
                        ) : (
                            <div  className="w-full flex items-center xl:h-12 px-2 py-1 xl:px-0 gap-2 xl:pl-2">
                                <Clickable aria-expanded={results} aria-controls="results-panel" className="flex items-center gap-2 xl:px-1 w-full" add={{results: (results && !isMobile) ? null : 'on'}} remove={["results"]}>
                                
                                <h1 className="text-base xl:text-lg text-neutral-900 font-sans">Resultat</h1>
                                
                                   <TitleBadge className="bg-accent-100 text-accent-900 text-sm xl:text-base" count={totalHits?.value || 0} />
                                   {!isMobile && (
                                        <>
                                            {results ? <PiCaretUpBold className="text-lg mr-1 ml-auto" /> : <PiCaretDownBold className="text-lg ml-auto" />}
                                        </>
                                    )}
                                </Clickable>
                            </div>
                        )}
                        {mapSettings ? <MapSettings/> : results && <div id="results-panel">{showDebugGroups ? <DebugToggle /> : <SearchResults />}</div>}                   
                    </RightWindow>}
                </DrawerWrapper>

                
            </div>
    </>

}