'use client'

import { PiBookOpen } from "react-icons/pi";
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
    return <Drawer {...rest}>{children}</Drawer>
}

function LeftWindow({children}: {children: React.ReactNode}) {
    const { isMobile } = useContext(GlobalContext)
    if (isMobile) {
        return <>{children}</>
    }
    return <div className="bg-white shadow-lg absolute left-2 top-[4rem] w-[calc(25svw-1rem)] bottom-[1.5rem] z-[3001] rounded-md p-2 overflow-y-auto overflow-x-hidden stable-scrollbar">{children}</div>
}

function RightWindow({children}: {children: React.ReactNode}) {
    const { isMobile } = useContext(GlobalContext)
    if (isMobile) {
        return <>{children}</>
    }
    return <div className="bg-white shadow-lg absolute right-2 top-[0.5rem] w-[25svw] bottom-[1.5rem] z-[3001] rounded-md overflow-y-auto overflow-x-hidden stable-scrollbar">{children}</div>
}

export default function OverlayInterface() {
    const snappedPosition = useSessionStore((s) => s.snappedPosition);
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition);
    const currentPosition = useSessionStore((s) => s.currentPosition);
    const setCurrentPosition = useSessionStore((s) => s.setCurrentPosition);
    const drawerOpen = useSessionStore((s) => s.drawerOpen);
    const setDrawerOpen = useSessionStore((s) => s.setDrawerOpen);

    const searchParams = useSearchParams()
    const { searchFilterParamsString } = useSearchQuery()
    const { totalHits } = useSearchData()
    const { groupData } = useGroupData()

    const drawerRef = useRef<HTMLDivElement>(null)
    const scrollableContent = useRef<HTMLDivElement>(null);
    const results = searchParams.get('results') == 'on'
    const options = searchParams.get('options') == 'on'
    const mapOptions = searchParams.get('mapOptions') == 'on'


    return <>
        {snappedPosition !== 'max' && <>
   
            {(!results || !drawerOpen) && <div className="absolute flex gap-2 left-4 z-[4000] h-12"
                style={{ bottom: drawerOpen ? `calc(${currentPosition}rem + +.5rem)` : '2rem' }}>
                <RoundClickable
                    className="pl-4"
                    add={{results: 'on'}}
                    remove={["options", "mapOptions"]}
                    onClick={() => setDrawerOpen(true)}
                >
                    <span className="flex items-center gap-2 whitespace-nowrap">
                        {!searchFilterParamsString && <PiBookOpen className="text-xl" aria-hidden="true" />}
                        {searchFilterParamsString && totalHits && totalHits.value > 0 ?
                            <span className="space-x-1">
                                <span className="uppercase tracking-wider font-semibold">Treff</span>
                                <span className="results-badge text-primary-700 bg-primary-200 font-bold left-8 rounded-full py-0.5 text-sm whitespace-nowrap px-1.5">
                                    {formatNumber(totalHits.value)}</span></span> : <span>{groupData?.label}</span>}
                    </span>
                </RoundClickable>
            </div>}
            {options && <div className="absolute flex gap-2 left-4 z-[4000] h-12"
                style={{ bottom: drawerOpen ? `calc(${currentPosition}rem + +.5rem)` : '2rem' }}>
                <RoundClickable
                    className="pl-4"
                    add={{results: 'on'}}
                    remove={["options", "mapOptions"]}
                    onClick={() => setDrawerOpen(true)}
                >
                    <span className="flex items-center gap-2 whitespace-nowrap">
                        {!searchFilterParamsString && <PiBookOpen className="text-xl" aria-hidden="true" />}
                        {searchFilterParamsString && totalHits && totalHits.value > 0 ?
                            <span className="space-x-1">
                                <span className="uppercase tracking-wider font-semibold">Treff</span>
                                <span className="results-badge text-primary-700 bg-primary-200 font-bold left-8 rounded-full py-0.5 text-sm whitespace-nowrap px-1.5">
                                    {formatNumber(totalHits.value)}</span></span> : <span>{groupData?.label}</span>}
                    </span>
                </RoundClickable>
            </div>}
            
        </>}

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
                    {options && <LeftWindow>    
                         <OptionsWindow />
                    </LeftWindow>}
                    {(results || mapOptions) && <RightWindow>
                        {(results ? <SearchResults/> : <MapSettings />)}                   
                    </RightWindow>}
                </DrawerWrapper>
                
            </div>
    </>

}