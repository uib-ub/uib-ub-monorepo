import { PiFunnel, PiGpsFix, PiInfoFill, PiMagnifyingGlassMinusFill, PiMagnifyingGlassPlusFill, PiStackPlus } from "react-icons/pi"
import { RoundIconButton, RoundIconClickable } from "../ui/clickable/round-icon-button"
import { getMyLocation } from "@/lib/map-utils"
import { useSessionStore } from "@/state/zustand/session-store"
import { useContext } from "react"
import { GlobalContext } from "@/state/providers/global-provider"
import { MAP_DRAWER_BOTTOM_HEIGHT_REM, MAP_DRAWER_MAX_HEIGHT_SVH } from "@/lib/map-utils"
import useSearchData from "@/state/hooks/search-data"


import { Badge, TitleBadge } from "../ui/badge"
import { useSearchQuery } from "@/lib/search-params"
import { useOverlayParams } from "@/lib/param-hooks"

export function FilterButton() {
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition)
    const { facetFilters, datasetFilters } = useSearchQuery()
    const filterCount = facetFilters.length + datasetFilters.length
    const { options } = useOverlayParams()

    return (
        <RoundIconClickable
            className="relative"
            label="Filter"
            add={{ options: 'on' }}
            onClick={() => setSnappedPosition('middle')}
        >
            <PiFunnel className="text-2xl" />
            {filterCount > 0 && (
                <TitleBadge
                    count={filterCount}
                    className={`text-xs absolute bottom-1.5 right-1.5 xl:text-base ${options ? 'bg-accent-100 text-accent-900' : 'bg-primary-700 text-white'}`}
                />
            )}
        </RoundIconClickable>
    )
}

export default function MapToolbar() {
    const { isMobile, mapFunctionRef } = useContext(GlobalContext)
    const currentPosition = useSessionStore((s) => s.currentPosition)
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition)
    const setMyLocation = useSessionStore((s) => s.setMyLocation)
    const snappedPosition = useSessionStore((s) => s.snappedPosition)
    const { totalHits, searchBounds, searchLoading, searchError } = useSearchData()
    const { options } = useOverlayParams()
    
    const svhToRem = (svh: number) => {
        if (typeof window === 'undefined' || typeof document === 'undefined') return 0
        const windowHeight = window.visualViewport?.height || window.innerHeight
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
        return ((svh / 100) * windowHeight) / rootFontSize
    }
    
    const middleRem = svhToRem(MAP_DRAWER_MAX_HEIGHT_SVH)
    

    // If the map is not ready, don't show the toolbar
    //if (!mapFunctionRef?.current) return null
    

    return (
        <>
        {!searchLoading && !searchBounds?.length && !searchError && totalHits?.value > 0 && snappedPosition !== 'top' &&
            
                <div
                    role="status"
                    aria-live="polite"
                    className="bg-neutral-900 rounded-md h-12 px-4 text-white opacity-90 flex gap-2 items-center w-fit absolute left-2 lg:left-[25svw] z-[3001] transition-opacity duration-300"
                    style={{
                        top: isMobile ? 
                            currentPosition <= MAP_DRAWER_BOTTOM_HEIGHT_REM ? "4rem" : 
                            `${Math.max(0.25, 4 - currentPosition + MAP_DRAWER_BOTTOM_HEIGHT_REM)}rem`
                            : "0.5rem",
                        opacity: isMobile ? 
                            currentPosition > middleRem ? 0 : 1
                            : 1
                    }}
                >
                    <PiInfoFill className="inline text-xl" /> Ingen treff med koordinatar
                </div>
            
        }
        <div
            className="flex gap-2 flex-col lg:flex-row absolute right-3 lg:right-[calc(25svw+1.5rem)] z-[5000]"
            style={{
                top: isMobile ?  currentPosition <= MAP_DRAWER_BOTTOM_HEIGHT_REM ? "4rem" : `${4-currentPosition + MAP_DRAWER_BOTTOM_HEIGHT_REM}rem` : "0.5rem",
            }}
        >
            <RoundIconClickable

                label="Kartinnstillingar"
                add={{ mapSettings: 'on' }}
                onClick={() => setSnappedPosition('middle')}
            >
                <PiStackPlus className="text-2xl" />
            </RoundIconClickable>
            {!isMobile && (
                <>
                    <RoundIconButton
                        onClick={() => mapFunctionRef?.current?.zoomIn(2)}
                        side="top"
                        label="Zoom inn"
                    >
                        <PiMagnifyingGlassPlusFill className="text-2xl" />
                    </RoundIconButton>

                    <RoundIconButton
                        onClick={() => mapFunctionRef?.current?.zoomOut(2)}
                        side="top"
                        label="Zoom ut"
                    >
                        <PiMagnifyingGlassMinusFill className="text-2xl" />
                    </RoundIconButton>
                </>

            )}

            <RoundIconButton
                onClick={() => {
                    getMyLocation((location) => {
                        mapFunctionRef?.current?.setView(location, 15)
                        setMyLocation(location)
                    })
                }}
                side="top"
                label="Min posisjon"
            >
                <PiGpsFix className="text-2xl" />
            </RoundIconButton>
            { isMobile && !options && (
                <FilterButton />
            )}
        </div>
        </>
    )
}