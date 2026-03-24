import { getMyLocation, MAP_DRAWER_BOTTOM_HEIGHT_REM } from "@/lib/map-utils"
import useSearchData from "@/state/hooks/search-data"
import { GlobalContext } from "@/state/providers/global-provider"
import { useSessionStore } from "@/state/zustand/session-store"
import { useNotificationStore } from "@/state/zustand/notification-store"
import { useContext, useEffect } from "react"
import { PiFunnel, PiFunnelFill, PiGpsFix, PiMagnifyingGlassMinusFill, PiMagnifyingGlassPlusFill, PiStackPlus } from "react-icons/pi"
import { RoundIconButton, RoundIconClickable, RoundIconClickableWithBadge } from "../ui/clickable/round-icon-button"
import { useRouter, useSearchParams } from "next/navigation"


import { useInitParam, useSourceViewOn, useTreeParam, useMapSettingsOn, usePointParam, useOptionsOn } from "@/lib/param-hooks"
import { useSearchQuery } from "@/lib/search-params"
import Clickable from "../ui/clickable/clickable"
import NotificationStack from "../ui/notification-stack";

export function FilterButton() {
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition)
    const { facetFilters, datasetFilters } = useSearchQuery()
    const filterCount = facetFilters.length + datasetFilters.length
    const optionsOn = useOptionsOn()
    const snappedPosition = useSessionStore((s) => s.snappedPosition)
    const { isMobile } = useContext(GlobalContext)


    return (
        <RoundIconClickableWithBadge
            className={`relative p-3 ${optionsOn ? 'bg-accent-800 text-white' : 'bg-primary-700 text-white'}`}
            label="Filter"
            aria-controls="options-panel"
            aria-expanded={optionsOn}
            add={{ options: optionsOn ? null : 'on' }}
            remove={isMobile ? ['mapSettings'] : []}
            isActive={optionsOn}
            onClick={() => {
                !optionsOn && snappedPosition !== 'middle' && setSnappedPosition('middle')
            }}
            count={filterCount}
        >
            {optionsOn ? <PiFunnelFill className="text-2xl" /> : <PiFunnel className="text-2xl" />}
        </RoundIconClickableWithBadge>
    )
}

export default function MapToolbar() {
    const { isMobile, mapFunctionRef } = useContext(GlobalContext)
    const searchParams = useSearchParams()
    const currentPosition = useSessionStore((s) => s.currentPosition)
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition)
    const setMyLocation = useSessionStore((s) => s.setMyLocation)
    const addNotification = useNotificationStore((s) => s.addNotification)
    const removeNotification = useNotificationStore((s) => s.removeNotification)
    const snappedPosition = useSessionStore((s) => s.snappedPosition)
    const { totalHits, searchBounds, searchLoading, searchError } = useSearchData()
    const mapSettingsOn = useMapSettingsOn()
    const tree = useTreeParam()
    const router = useRouter()
    const sourceViewOn = useSourceViewOn()
    const point = usePointParam()
    const init = useInitParam()
    const showNoCoordinatesNotice = !searchLoading && !searchBounds?.length && !searchError && totalHits?.value > 0 && snappedPosition !== 'top'
    const notificationTop = isMobile
        ? currentPosition <= MAP_DRAWER_BOTTOM_HEIGHT_REM
            ? "4rem"
            : `${Math.max(0.25, 4 - currentPosition + MAP_DRAWER_BOTTOM_HEIGHT_REM)}rem`
        : "0.5rem"
    // Reserve space on the right so snackbars never overlap toolbar controls.
    const notificationRight = isMobile
        ? "5rem"
        : `calc(${tree ? "40svw" : "25svw"} + 16rem)`
    
    useEffect(() => {
        if (showNoCoordinatesNotice) {
            addNotification({
                id: "no-coordinates",
                message: <><span>Ingen treff med koordinater</span> <Clickable className='ml-2' add={{ mode: 'table' }} remove={['group', 'init', 'zoom', 'center', 'point', 'activePoint', 'facet']} link href="/search">Vis tabell</Clickable></>,
            })
        } else {
            removeNotification("no-coordinates")
        }
        return () => removeNotification("no-coordinates")
    }, [addNotification, removeNotification, showNoCoordinatesNotice])

    useEffect(() => {
        if (point && !init) {
            addNotification({
                id: "point-hint",
                message: isMobile ? "Trykk og hald i kartet for å flytte startpunktet" : "Høgreklikk i kartet for å flytte startpunktet",
                variant: "tooltip",
            })
        } else {
            removeNotification("point-hint")
        }
        return () => removeNotification("point-hint")
    }, [addNotification, init, isMobile, point, removeNotification])

    // If the map is not ready, don't show the toolbar
    //if (!mapFunctionRef?.current) return null


    return (
        <>
            <NotificationStack
                className={`absolute z-[3001] ${isMobile ? "left-2" : "left-[25svw]"}`}
                style={{ top: notificationTop, right: notificationRight }}
            />
                

            <div
                className={`flex gap-3 absolute lg: z-[5000] ${isMobile ? 'right-3 flex-col' : (tree ? 'right-[calc(40svw+1.25rem)]' : 'right-[calc(25svw+1.25rem)]')} `}
                style={{
                    top: isMobile ? currentPosition <= MAP_DRAWER_BOTTOM_HEIGHT_REM ? "4.25rem" : `${4 - currentPosition + MAP_DRAWER_BOTTOM_HEIGHT_REM}rem` : "0.5rem",
                }}
            >
                <RoundIconButton
                    onClick={() => {
                        getMyLocation((location) => {
                            mapFunctionRef?.current?.setView(location, 15)

                            const newUrl = new URLSearchParams(searchParams)
                            newUrl.set('center', `${location[0]},${location[1]}`)
                            newUrl.set('point', `${location[0]},${location[1]}`)
                            newUrl.delete('group')
                            newUrl.delete('init')
                            //newUrl.set('zoom', '15')
                            router.push(`?${newUrl.toString()}`)
                        })
                    }}
                    side="top"
                    label="Min posisjon"
                    className="p-3"
                >
                    <PiGpsFix className="text-2xl" />
                </RoundIconButton>
                <RoundIconClickable
                    className={`p-3 ${mapSettingsOn ? 'bg-accent-800 text-white' : ''}`}
                    aria-controls="map-settings-panel"
                    aria-expanded={mapSettingsOn}
                    label="Kartinnstillingar"
                    remove={['overlaySelector', ...(isMobile ? ['options'] : [])]}
                    add={{ mapSettings: mapSettingsOn ? null : 'on' }}
                    onClick={() => !mapSettingsOn && setSnappedPosition('middle')}
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

                
                {isMobile && sourceViewOn && (
                    <FilterButton />
                )}
            </div>
        </>
    )
}