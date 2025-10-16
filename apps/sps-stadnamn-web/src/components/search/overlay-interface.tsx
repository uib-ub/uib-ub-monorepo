'use client'

import { PiBookOpen, PiCaretDown, PiCaretDownBold, PiCaretUpBold, PiCrop, PiEye, PiEyeSlash, PiFunnel, PiMapPin, PiSliders, PiX } from "react-icons/pi";
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
    const [resetEnabled, setResetEnabled] = useState<boolean>(false);
    const facet = useSearchParams().get('facet')
    const { totalHits } = useSearchData()
    const mode = useMode()


    useEffect(() => {
        if (!isMobile || !mapFunctionRef?.current) return
        const point = groupData?.sources?.[0]?.location?.coordinates
        if (!point) return

        

        

        const wasAdjusted = panPointIntoView(mapFunctionRef.current, [point[1], point[0]], true, snappedPosition === 'middle', resetEnabled)
        if (wasAdjusted) {
            setResetEnabled(!resetEnabled)
        }
        
    }, [isMobile, snappedPosition])

    if (!isMobile) {
        return <>{children}</>
    }
    
    if (isMobile && facet) {
        return <div className="fixed top-0 left-0 w-full h-full z-[3001] bg-white"><div className="h-[calc(100svh-3rem)] overflow-y-auto stable-scrollbar">{children}</div>
        <Clickable remove={["facet"]} add={{results: 'on'}} className="w-full h-12 text-xl flex items-center justify-center items-center bg-primary-800 text-white relative">Vis resultat <Badge className="bg-primary-50 text-primary-800 font-bold absolute right-4" count={totalHits?.value || 0} /></Clickable>
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
    const drawerOpen = useSessionStore((s) => s.drawerOpen);
    const setDrawerOpen = useSessionStore((s) => s.setDrawerOpen);
    const { isMobile, mapFunctionRef } = useContext(GlobalContext)
    const searchParams = useSearchParams()
    const q = searchParams.get('q')


    const { searchFilterParamsString } = useSearchQuery()
    const { totalHits, searchBounds } = useSearchData()
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
                    {(!isMobile || ( !results && !mapSettings)) && <LeftWindow>  
                        {facet ? <div className="w-full flex items-center px-2 xl:px-0 h-12 gap-2 xl:pl-2 flex">
                            <h1 className="text-lg xl:text-xl text-neutral-900">{fieldConfig[perspective][facet]?.label}</h1>
                            <div className="flex items-center gap-1 ml-auto">
                                    <ClickableIcon label="Lukk" className="p-2" remove={["facet"]}>
                                        <PiX className="text-black text-3xl" />
                                    </ClickableIcon>
                                </div>
                            
                        </div>
                        
                        :<Clickable notClickable={isMobile} add={{options: options ? null : 'on'}} remove={["options"]}  className="w-full flex items-center xl:h-12 px-2 pt-1 xl:px-0 gap-2 xl:pl-2">
                        {
                            !isMobile && <>
                                {options ? <PiCaretUpBold className="text-xl" /> : <PiCaretDownBold className="text-xl" />}
                            </>
                        }
                        <h1 className="text-base xl:text-xl text-neutral-900">Filter</h1>
                            
                                
                            
                            
                            { filterCount && !isMobile ? <TitleBadge className="bg-primary-200 text-primary-800 font-bold" count={filterCount} /> : null}
                                
                            
                            <div className="flex items-center gap- ml-auto">
                            {isMobile && totalHits?.value > 0 && <Clickable onClick={() => snappedPosition == 'bottom' ? setSnappedPosition('middle') : null}  className={`bg-primary-800 rounded-full px-2 ${totalHits.value > 0 ? 'pr-1' : ''} py-1 flex items-center gap-1 text-white text-sm xl:text-base font-semibold`} add={{results: 'on'}} remove={["options"]}>
                            Vis resultat{totalHits?.value > 0 && <Badge className="bg-primary-50 text-primary-800 font-bold" count={totalHits.value} />}
                        </Clickable>}
                        {!totalHits?.value && isMobile && <span className="text-sm xl:text-bas px-2">Ingen resultat</span>}
                        </div>
                            </Clickable>}
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
                    
                    <RightWindow>
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
                            <Clickable notClickable={isMobile} add={{results: results ? null : 'on'}} remove={["results"]} className="w-full flex items-center xl:h-12 px-2 py-1 xl:px-0 gap-2 xl:pl-2">
                                {!isMobile && (
                                        <>
                                            {results ? <PiCaretUpBold className="text-xl" /> : <PiCaretDownBold className="text-xl" />}
                                        </>
                                    )}
                                <h1 className="text-base xl:text-xl text-neutral-900">Resultat</h1>
                                
                                    <TitleBadge className="bg-primary-200 text-primary-800 font-bold text-sm xl:text-base" count={totalHits?.value || 0} />
                                
                                <div className="flex items-center gap-1 ml-auto">
                                    {isMobile && (
                                        <Clickable remove={["results"]} onClick={() => snappedPosition == 'bottom' ? setSnappedPosition('middle') : null} className={`bg-neutral-800 rounded-full px-2 py-1 flex items-center gap-1 text-white text-sm xl:text-base ${filterCount > 0 ? 'pl-1' : ''}`}>
                                            {filterCount > 0 ? <Badge className="bg-white text-neutral-800 font-bold" count={filterCount} /> :  <PiSliders className="text-white text-lg" aria-hidden="true" />}Filter
                                        </Clickable>
                                    )}
                                    
                                </div>
                            </Clickable>
                        )}
                        {(mapSettings ? <MapSettings/> : results && <SearchResults />)}                   
                    </RightWindow>
                </DrawerWrapper>
                
            </div>
    </>

}