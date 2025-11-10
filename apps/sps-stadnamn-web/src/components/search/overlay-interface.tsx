'use client'

import { PiBookOpen, PiCaretDown, PiCaretDownBold, PiCaretLeftBold, PiCaretUpBold, PiCrop, PiEye, PiEyeSlash, PiFunnel, PiInfoFill, PiMapPin, PiSliders, PiTableFill, PiX } from "react-icons/pi";
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

function DrawerWrapper({ children, groupData, ...rest }: DrawerProps) {
    const { isMobile, mapFunctionRef } = useContext(GlobalContext)
    const snappedPosition = useSessionStore((s) => s.snappedPosition);
    const resetEnabled = useRef<boolean>(false);
    const facet = useSearchParams().get('facet')
    const { totalHits } = useSearchData()
    const mode = useMode()
    const showDebugGroups = useDebugStore((s: any) => s.showDebugGroups)


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
        return <div className="fixed top-0 left-0 w-full h-full z-[3001] bg-white"><div className="h-[calc(100svh-4rem)] overflow-y-auto stable-scrollbar">{children}</div>
        <div className="bg-neutral-200 p-2"><Clickable remove={["facet"]} add={{results: 'on'}} className="w-full h-12 text-xl rounded-md flex items-center justify-center items-center bg-primary-800 text-white relative">Vis resultat <Badge className="bg-primary-50 text-primary-800 font-semibold px-2 absolute right-4" count={totalHits?.value || 0} /></Clickable></div>
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
    return <div className="bg-white shadow-lg absolute left-2 top-[4rem] w-[calc(25svw-1rem)] max-h-[calc(100svh-4.5rem)] z-[3001] rounded-md overflow-y-auto overflow-x-hidden stable-scrollbar">{children}</div>
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
    const showDebugGroups = useDebugStore((s: any) => s.showDebugGroups)

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



                        || (facet && <div className="w-full flex items-center px-2 xl:px-0 h-12 gap-2 xl:pl-2 flex">
                            <h1 className="text-lg xl:text-xl text-neutral-900 px-1">{fieldConfig[perspective][facet]?.label}</h1>
                            <div className="flex items-center gap-1 ml-auto">
                                    <Clickable className="flex items-center gap-1 px-2" label="Tilbake" remove={["facet"]}>
                                        <PiCaretLeftBold className="text-black text-lg" />Tilbake
                                    </Clickable>
                                </div>
                            
                        </div>)
                        
                        || <div  className="w-full flex items-center lg:h-12 px-2 xl:px-0 gap-2 xl:pl-2">
                        <Clickable className="flex items-center gap-2" add={{options: (options && !isMobile) ? null : 'on'}} remove={["options"]}>
                        {
                            !isMobile && <>
                                {options ? <PiCaretUpBold className="text-xl" /> : <PiCaretDownBold className="text-xl" />}
                            </>
                        }
                        <h1 className="text-base xl:text-xl text-neutral-900 font-sans">Alternativ</h1>
                            
                                
                            
                            
                            { filterCount && !isMobile ? <TitleBadge className="bg-primary-200 text-primary-800 font-bold" count={filterCount} /> : null}
                                
                            </Clickable>
                            <div className="flex items-center gap- ml-auto mt-1">
                            {mode == 'map' && isMobile && totalHits?.value > 0 && <Clickable onClick={() => snappedPosition == 'bottom' ? setSnappedPosition('middle') : null}  className={`btn btn-outline rounded-full px-2 ${totalHits.value > 0 ? 'pr-1' : ''} py-1 flex items-center gap-1 xl:text-base`} add={{results: 'on'}} remove={["options"]}>
                            <span className="px-1 text-semibold">Resultat</span>{totalHits?.value > 0 && <Badge className="bg-primary-700 text-white" count={totalHits.value} />}
                        </Clickable>}
                        {mode == 'table' && <Clickable add={{tableOptions: 'on'}} remove={["tableOptions"]} className="btn btn-outline rounded-full px-2 py-1 pr-3 flex items-center gap-2 text-sm xl:text-base">
                            <PiTableFill className="text-neutral-900" /> Kolonner
                        </Clickable>}
                        {!totalHits?.value && isMobile && <span className="text-sm xl:text-bas px-2">Ingen resultat</span>}
                        </div>
                            </div>}
                        {(options || isMobile) && !facet && <><ActiveFilters />
                        
                        

                        



                               <FacetSection /></>}
                        {facet && <div className="flex flex-col gap-2"> 
                        {facet == 'adm' ? (
                            <ClientFacet facetName={facet} />
                        ) : facet == 'wikiAdm' ? (
                            <WikiAdmFacet />
                        ) : facet == 'dataset' ? (
                            <DatasetFacet />
                        ) : (
                            <ServerFacet />
                        )}
                        </div>}
                    </LeftWindow>}
                    
                    {mode == 'map' && <RightWindow>
                        {/* Map Settings Header (separate, only when mapSettings is on) */}
                        {mapSettings ? (
                            <div className="w-full flex items-center xl:h-12 px-2 xl:px-0 gap-2">
                                <h1 className="text-base xl:text-xl text-neutral-900 xl:px-4">Kartinnstillingar</h1>
                                <div className="flex items-center gap-1 ml-auto">
                                    <ClickableIcon label="Lukk" className="p-2" remove={["mapSettings"]}>
                                        <PiX className="text-black text-3xl" />
                                    </ClickableIcon>
                                </div>
                            </div>
                        ) : (
                            <div  className="w-full flex items-center xl:h-12 px-2 py-1 xl:px-0 gap-2 xl:pl-2">
                                <Clickable className="flex items-center gap-2 xl:px-2" add={{results: (results && !isMobile) ? null : 'on'}} remove={["results"]}>
                                {!isMobile && (
                                        <>
                                            {results ? <PiCaretUpBold className="text-xl" /> : <PiCaretDownBold className="text-xl" />}
                                        </>
                                    )}
                                <h1 className="text-base xl:text-xl text-neutral-900 font-sans">Resultat</h1>
                                
                                   <TitleBadge className="bg-accent-100 text-accent-900 text-sm xl:text-base" count={totalHits?.value || 0} />
                                </Clickable>
                                <div className="flex items-center gap-2 ml-auto">
                                    <ClickableIcon 
                                        add={{mode: 'table'}} 
                                        className="flex items-center btn btn-outline rounded-full p-1 px-2 h-7 xl:h-10 xl:text-lg xl:w-10 justify-center text-sm"
                                        label="Vis kjeldetabell"
                                    >
                                        <PiTableFill className="text-neutral-900" />
                                    </ClickableIcon>
                                    {isMobile && (
                                        <Clickable 
                                            remove={["results"]} 
                                            onClick={() => snappedPosition == 'bottom' ? setSnappedPosition('middle') : null} 
                                            className={`btn btn-outline rounded-full px-2 py-1 pr-3 flex items-center gap-2 text-sm xl:text-base h-7 xl:h-10 ${filterCount > 0 ? 'pl-1' : ''}`}
                                        >
                                            {filterCount > 0 
                                                ? <Badge className="bg-neutral-800 text-white font-bold" count={filterCount} />
                                                :  <PiSliders className="text-lg" aria-hidden="true" />
                                            }
                                            Filtre
                                        </Clickable>
                                    )}
                                </div>
                            </div>
                        )}
                        {(mapSettings ? <MapSettings/> : results && (showDebugGroups ? <DebugToggle /> : <SearchResults />))}                   
                    </RightWindow>}
                </DrawerWrapper>

                
            </div>
    </>

}