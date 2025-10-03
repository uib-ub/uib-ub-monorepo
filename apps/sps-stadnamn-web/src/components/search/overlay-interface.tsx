'use client'

import { PiBookOpen, PiCrop, PiFunnel, PiMapPin, PiSliders, PiX } from "react-icons/pi";
import { RoundClickable } from "../ui/clickable/round-icon-button";
import dynamic from "next/dynamic";
import { formatNumber } from "@/lib/utils";
import SearchResults from "./nav/results/search-results";
import MapSettings from "../map/map-settings";
import { useSessionStore } from "@/state/zustand/session-store";
import { useContext, useRef } from "react";
import useGroupData from "@/state/hooks/group-data";
import { useSearchQuery } from "@/lib/search-params";
import { GlobalContext } from "@/state/providers/global-provider";
import useSearchData from "@/state/hooks/search-data";
import { useSearchParams } from "next/navigation";
import OptionsWindow from "./nav/options-window";
import Clickable from "../ui/clickable/clickable";
import { MAP_DRAWER_MIN_HEIGHT_REM, MAP_DRAWER_MAX_HEIGHT_SVH } from "@/lib/map-utils";
import ClickableIcon from "../ui/clickable/clickable-icon";




const Drawer = dynamic(() => import("../ui/drawer"), {
    ssr: false
});

export interface DrawerProps {
    children: React.ReactNode
    drawerOpen: boolean
    dismissable: boolean
    setDrawerOpen: (open: boolean) => void
    snappedPosition: 'min' | 'max'
    setSnappedPosition: (position: 'min' | 'max') => void
    currentPosition: number
    setCurrentPosition: (position: number) => void
    minHeightRem?: number
    maxHeightSvh?: number,
    scrollContainerRef?: React.RefObject<HTMLDivElement>
}

function DrawerWrapper({ children, ...rest }: DrawerProps) {
    const { isMobile } = useContext(GlobalContext)
    if (!isMobile) {
        return <>{children}</>
    }
    return <Drawer {...rest} minHeightRem={MAP_DRAWER_MIN_HEIGHT_REM} maxHeightSvh={MAP_DRAWER_MAX_HEIGHT_SVH}>{children}</Drawer>
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
    return <div className="bg-white shadow-lg absolute left-2 top-[4rem] w-[calc(25svw-1rem)] max-h-[calc(100svh-4.5rem)] z-[3001] rounded-md p-2 overflow-y-auto overflow-x-hidden stable-scrollbar">{children}</div>
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
    return <div className="bg-white shadow-lg absolute right-2 top-[0.5rem] w-[25svw] max-h-[calc(100svh-4.5rem)] z-[3001] rounded-md overflow-y-auto overflow-x-hidden stable-scrollbar">{children}</div>
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
    const { searchFilterParamsString } = useSearchQuery()
    const { totalHits, searchBounds } = useSearchData()
    const { groupData } = useGroupData()

    const drawerRef = useRef<HTMLDivElement>(null)
    const scrollableContent = useRef<HTMLDivElement>(null);
    const results = searchParams.get('results') == 'on'
    const options = searchParams.get('options') == 'on'
    const mapSettings = searchParams.get('mapSettings') == 'on'


    return <>


        <div ref={drawerRef}  className="scroll-container">
                <DrawerWrapper 
                    drawerOpen={true}
                    dismissable={false}
                    setDrawerOpen={setDrawerOpen}
                    snappedPosition={snappedPosition}
                    setSnappedPosition={setSnappedPosition}
                    currentPosition={currentPosition}
                    setCurrentPosition={setCurrentPosition}
                    scrollContainerRef={scrollableContent}
                >
                    {(options || (isMobile && !results && !mapSettings)) && <LeftWindow>  
                         <OptionsWindow />
                    </LeftWindow>}
                    
                    <RightWindow>
                        <div className="w-full flex items-center xl:h-12 px-2 xl:px-0 gap-2">
                        
                            { !mapSettings && <><h1 className="text-lg xl:text-xl text-neutral-900 xl:px-4">Treff</h1><Clickable className="results-badge bg-primary-200 text-primary-700 rounded-full flex items-center gap-1" onClick={() => {
                                    if (searchBounds?.length) {
                                        mapFunctionRef?.current?.flyToBounds(searchBounds, { duration: 0.25, maxZoom: 18, padding: [50, 50] });
                                    }
                                }}  
                            >
                                {formatNumber(totalHits?.value || 0)} <PiCrop className="text-primary-700 text-lg" />
                                
                            </Clickable></>
                            }
                            { mapSettings && <h1 className="text-lg xl:text-xl text-neutral-900 xl:px-4">Kartinnstillingar</h1>}
                            
                        <div className="flex items-center gap-1 pb-1 ml-auto">
                        {isMobile && !mapSettings && <Clickable  className="bg-neutral-800 rounded-full px-2 py-1 flex items-center gap-1 text-white text-sm xl:text-base" remove={["results"]}>
                           <PiSliders className="text-white text-lg" />Alternativ
                        </Clickable>}
                        { mapSettings && <ClickableIcon label="Lukk" className="" remove={["mapSettings"]}>
                            <PiX className="text-black text-2xl" />
                        </ClickableIcon>}
                        </div>
                        </div>
                        {(mapSettings ? <MapSettings/> : results && <SearchResults />)}                   
                    </RightWindow>
                </DrawerWrapper>
                
            </div>
    </>

}