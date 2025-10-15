import { PiGpsFix, PiMagnifyingGlassMinusFill, PiMagnifyingGlassPlusFill, PiStackPlus } from "react-icons/pi"
import { RoundIconButton, RoundIconClickable } from "../ui/clickable/round-icon-button"
import { getMyLocation } from "@/lib/map-utils"
import { useSessionStore } from "@/state/zustand/session-store"
import { useContext } from "react"
import { GlobalContext } from "@/state/providers/global-provider"
import { MAP_DRAWER_MIN_HEIGHT_REM } from "@/lib/map-utils"

export default function MapToolbar() {
    const { isMobile, mapFunctionRef } = useContext(GlobalContext)
    const currentPosition = useSessionStore((s) => s.currentPosition)
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition)
    const setMyLocation = useSessionStore((s) => s.setMyLocation)
    

    // If the map is not ready, don't show the toolbar
    if (!mapFunctionRef?.current) return null
    

    return (
        <div
            className="flex gap-2 flex-col xl:flex-row absolute right-3 xl:right-[calc(25svw+1.5rem)] z-[5000]"
            style={{
                top: isMobile ?  currentPosition <= MAP_DRAWER_MIN_HEIGHT_REM ? "4rem" : `${4-currentPosition + MAP_DRAWER_MIN_HEIGHT_REM}rem` : "0.5rem",
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
        </div>
    )
}