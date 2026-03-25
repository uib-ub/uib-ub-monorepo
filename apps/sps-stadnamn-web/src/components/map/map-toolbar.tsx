import {
    getMyLocation,
    MAP_DRAWER_BOTTOM_HEIGHT_REM,
    MOBILE_SEARCH_FIELD_BOTTOM_OFFSET_REM,
    mobileSearchChromeWrapperTopStyle,
    mobileStackBelowSearchChromeTopStyle,
} from "@/lib/map-utils"
import useSearchData from "@/state/hooks/search-data"
import { GlobalContext } from "@/state/providers/global-provider"
import { useSessionStore } from "@/state/zustand/session-store"
import { useNotificationStore } from "@/state/zustand/notification-store"
import { useContext, useEffect } from "react"
import { PiFunnel, PiFunnelFill, PiGpsFix, PiMagnifyingGlassMinusFill, PiMagnifyingGlassPlusFill, PiStackPlus, PiXBold } from "react-icons/pi"
import { RoundIconButton, RoundIconClickable, RoundIconClickableWithBadge } from "../ui/clickable/round-icon-button"
import { useRouter, useSearchParams } from "next/navigation"


import { useInitParam, useSourceViewOn, useTreeParam, useMapSettingsOn, usePointParam, useOptionsOn } from "@/lib/param-hooks"
import { useSearchQuery } from "@/lib/search-params"
import Clickable from "../ui/clickable/clickable"
import NotificationStack from "../ui/notification-stack"
import { cn } from "@/lib/utils"

export function FilterButton() {
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition)
    const { facetFilters, datasetFilters } = useSearchQuery()
    const filterCount = facetFilters.length + datasetFilters.length
    const optionsOn = useOptionsOn()
    const snappedPosition = useSessionStore((s) => s.snappedPosition)
    const { isMobile } = useContext(GlobalContext)


    return (
        <RoundIconClickableWithBadge
            className={`relative btn btn-primary ${snappedPosition === 'bottom' ? 'p-2' : 'p-3'} ${optionsOn ? 'bg-accent-800 text-white' : 'bg-primary-700 text-white'}`}
            label="Filter"
            aria-controls="options-panel"
            aria-expanded={optionsOn}
            add={{ options: optionsOn ? null : 'on' }}
            remove={isMobile ? ['mapSettings'] : []}
            isActive={optionsOn}
            badgeVariant={snappedPosition === "bottom" ? "compact" : "default"}
            onClick={() => {
                !optionsOn && snappedPosition !== 'middle' && setSnappedPosition('middle')
            }}
            count={filterCount}
        >
            {optionsOn ? <PiFunnelFill className={`${snappedPosition === 'bottom' ? 'text-lg' : 'text-2xl'}`} /> : <PiFunnel className={`${snappedPosition === 'bottom' ? 'text-lg' : 'text-2xl'}`} />}
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
    const notifications = useNotificationStore((s) => s.notifications)
    const snappedPosition = useSessionStore((s) => s.snappedPosition)
    const { totalHits, searchBounds, searchLoading, searchError } = useSearchData()
    const mapSettingsOn = useMapSettingsOn()
    const tree = useTreeParam()
    const router = useRouter()
    const sourceViewOn = useSourceViewOn()
    const optionsOn = useOptionsOn()
    const point = usePointParam()
    const init = useInitParam()
    const showNoCoordinatesNotice =
        !searchLoading && !searchBounds?.length && !searchError && totalHits?.value > 0
    // Mobile: under search while drawer is collapsed; fixed bottom (above “Vis resultat”) when middle/top.
    const notificationTop = isMobile
        ? mobileStackBelowSearchChromeTopStyle(currentPosition, snappedPosition)
        : "0.5rem"
    const notificationRight = isMobile ? undefined : `calc(${tree ? "40svw" : "25svw"} + 16rem)`

    // When dragging from bottom -> middle, the stack should move up until it reaches the top and then stop.
    const clampedNotificationTop = isMobile ? `max(0rem, ${notificationTop})` : notificationTop

    // Mobile toolbar buttons:
    // - keep them in the upper-right corner
    // - slide upward as the drawer is dragged up (by decreasing `top`)
    const showMobileToolbarButtons = true
    const notificationRowHeightRem = 3.5
    const toolbarNotificationGapRem = 0.25
    
    useEffect(() => {
        if (showNoCoordinatesNotice) {
            addNotification({
                id: "no-coordinates",
                message: "Ingen treff med koordinater",
                link: (
                    <Clickable
                        add={{ mode: "table" }}
                        remove={["group", "init", "zoom", "center", "point", "activePoint", "facet"]}
                        link
                        href="/search"
                    >
                        Vis tabell
                    </Clickable>
                ),
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
                permanentDismiss: true,
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
            {notifications.length > 0 && (
                <NotificationStack
                    disableStackEffect={isMobile}
                    className={cn(
                        isMobile
                            ? "absolute inset-x-0 z-[5100]"
                            : "absolute left-[25svw] z-[3001]",
                    )}
                    style={{
                        top: clampedNotificationTop,
                        ...(notificationRight != null ? { right: notificationRight } : {}),
                    }}
                />
            )}
                

            {showMobileToolbarButtons && (
                <div
                    className={`flex gap-3 absolute lg: z-[5000] ${isMobile ? 'right-3 flex-col' : (tree ? 'right-[calc(40svw+1.25rem)]' : 'right-[calc(25svw+1.25rem)]')} `}
                    style={{
                        top: (() => {
                            if (!isMobile) return "0.5rem"
                            const baseTop =
                                currentPosition <= MAP_DRAWER_BOTTOM_HEIGHT_REM
                                    ? "4.25rem"
                                    : `${4 - currentPosition + MAP_DRAWER_BOTTOM_HEIGHT_REM}rem`
                            if (notifications.length === 0) return baseTop
                            return `calc(${baseTop} + ${notificationRowHeightRem + toolbarNotificationGapRem}rem)`
                        })(),
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

                
                </div>
            )}
        </>
    )
}