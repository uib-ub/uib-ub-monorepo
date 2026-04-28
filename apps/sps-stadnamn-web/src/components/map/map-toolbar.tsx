import {
    getMyLocation,
    MAP_DRAWER_BOTTOM_HEIGHT_REM,
    MOBILE_SEARCH_FIELD_BOTTOM_OFFSET_REM,
    mobileSearchChromeWrapperTopStyle,
    mobileStackBelowSearchChromeTopStyle,
} from "@/lib/map-utils"
import useSearchData from "@/state/hooks/search-data"
import useResultCardData from "@/state/hooks/result-card-data"
import { GlobalContext } from "@/state/providers/global-provider"
import { useSessionStore } from "@/state/zustand/session-store"
import { useNotificationStore } from "@/state/zustand/notification-store"
import { useContext, useEffect, useRef } from "react"
import { PiChatCircleText, PiFunnel, PiFunnelFill, PiGpsFix, PiMagnifyingGlassMinusFill, PiMagnifyingGlassPlusFill, PiStackPlus, PiX } from "react-icons/pi"
import { RoundIconButton, RoundIconClickable, RoundIconClickableWithBadge } from "../ui/clickable/round-icon-button"
import { useRouter, useSearchParams } from "next/navigation"


import { useCenterParam, useFulltextOn, useGroupParam, useHideResultsOn, useInitParam, useMapSettingsOn, useNoGeoOn, useOptionsOn, usePoint, useQParam, useSourceViewOn, useTreeParam, useZoomParam } from "@/lib/param-hooks"
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
    const group = useGroupParam()
    const q = useQParam()
    const center = useCenterParam()
    const zoom = useZoomParam()
    const fulltextOn = useFulltextOn()
    const noGeoOn = useNoGeoOn()
    const optionsOn = useOptionsOn()
    const hideResultsOn = useHideResultsOn()
    const point = usePoint()
    const init = useInitParam()
    const sourceViewResetUrl = useSessionStore((s) => s.sourceViewResetUrl)
    const clearSourceViewResetUrl = useSessionStore((s) => s.clearSourceViewResetUrl)
    const {
        resultCardData: groupResultCardData,
        resultCardLoading: groupResultCardLoading,
        resultCardFetching: groupResultCardFetching,
    } = useResultCardData(group)
    const showNoCoordinatesNotice =
        !searchLoading && !searchBounds?.length && !searchError && totalHits?.value > 0
    const hasNoCoordinatesNotice = notifications.some((item) => item.id === "no-coordinates")
    const hasPointHint = notifications.some((item) => item.id === "point-hint")
    const noCoordinatesDismissedRef = useRef(false)
    const prevHasNoCoordinatesNoticeRef = useRef(false)

    // Mobile: under search while drawer is collapsed; fixed bottom (above “Vis resultat”) when middle/top.
    const notificationTop = isMobile
        ? mobileStackBelowSearchChromeTopStyle(currentPosition, snappedPosition)
        : "0.5rem"

    // When dragging from bottom -> middle, the stack should move up until it reaches the top and then stop.
    const clampedNotificationTop = isMobile ? `max(0rem, ${notificationTop})` : notificationTop

    // Mobile toolbar buttons:
    // - keep them in the upper-right corner
    // - slide upward as the drawer is dragged up (by decreasing `top`)
    const showMobileToolbarButtons = true
    const notificationRowHeightRem = 3.5
    const toolbarNotificationGapRem = 0.25

    const mobileControlsTop = (() => {
        if (!isMobile) return undefined
        const baseTop =
            currentPosition <= MAP_DRAWER_BOTTOM_HEIGHT_REM
                ? "4.25rem"
                : `${4 - currentPosition + MAP_DRAWER_BOTTOM_HEIGHT_REM}rem`
        if (notifications.length === 0) return baseTop
        return `calc(${baseTop} + ${notificationRowHeightRem + toolbarNotificationGapRem}rem)`
    })()
    
    useEffect(() => {
        // Reset manual-dismiss suppression once the underlying condition clears.
        if (!showNoCoordinatesNotice) {
            noCoordinatesDismissedRef.current = false
        }

        // If the notice disappears while condition is still true, treat it as
        // a user dismissal and keep it hidden until condition changes.
        if (
            showNoCoordinatesNotice &&
            prevHasNoCoordinatesNoticeRef.current &&
            !hasNoCoordinatesNotice
        ) {
            noCoordinatesDismissedRef.current = true
        }

        if (showNoCoordinatesNotice && !hasNoCoordinatesNotice && !noCoordinatesDismissedRef.current) {
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
        } else if (!showNoCoordinatesNotice && hasNoCoordinatesNotice) {
            removeNotification("no-coordinates")
        }
        prevHasNoCoordinatesNoticeRef.current = hasNoCoordinatesNotice
    }, [addNotification, hasNoCoordinatesNotice, removeNotification, showNoCoordinatesNotice])

    useEffect(() => {
        if (point && !init && !hasPointHint) {
            addNotification({
                id: "point-hint",
                message: isMobile ? "Trykk og hold i kartet for å flytte startpunktet" : "Høgreklikk i kartet for å flytte startpunktet",
                variant: "tooltip",
                permanentDismiss: true,
            })
        } else if ((!point || init) && hasPointHint) {
            removeNotification("point-hint")
        }
    }, [addNotification, hasPointHint, init, isMobile, point, removeNotification])


    return (
        <>
            {notifications.length > 0 ? (
                <NotificationStack
                    disableStackEffect={isMobile}
                    className={cn(
                        isMobile
                            ? "absolute inset-x-0 z-[5100]"
                            : cn(
                                "absolute left-[25svw] z-[3001] w-max max-w-full",
                                // Desktop available width is only affected by the tree drawer width.
                                tree
                                    ? "max-w-[calc(100vw-25svw-40svw-16rem)]"
                                    : "max-w-[calc(100vw-25svw-25svw-16rem)]",
                            ),
                    )}
                    style={{
                        top: clampedNotificationTop,
                    }}
                />
            ) : null}

            {notifications.length === 0 ? (
                <div
                    className={cn(
                        "absolute",
                        isMobile
                            ? "left-3 right-[5.25rem] z-[5100]"
                            : "z-[3001] left-2 top-14 mt-2 lg:mt-0 lg:top-2 lg:left-[30svw] xl:left-[25svw]"
                    )}
                    style={isMobile ? { top: mobileControlsTop } : undefined}
                >
                        <Clickable
                            link
                            href="https://skjemaker.app.uib.no/view.php?id=16665712"
                            className="btn btn-outline rounded-md inline-flex items-center gap-2 override-external-icon transition-none w-fit lg:h-12 lg:px-6 xl:text-lg"
                        >
                            <span>Tilbakemelding</span>
                        </Clickable>
                    
                </div>
            ) : null}


            {showMobileToolbarButtons && (
                <div
                    className={`flex gap-3 absolute z-[5000] ${isMobile
                        ? 'right-3 flex-col'
                        : `right-3 flex-col top-14 mt-2 lg:top-auto lg:bottom-4 lg:m-0 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 lg:flex-row`
                        }`}
                    style={{
                        top: isMobile ? mobileControlsTop : undefined,
                    }}
                >
                <RoundIconButton
                    onClick={() => {
                        // Re-focus immediately on existing start point so repeated clicks
                        // still bring it into view even before geolocation resolves.
                        if (point && mapFunctionRef?.current) {
                            mapFunctionRef.current.panTo?.([point[0], point[1]], { animate: false })
                        }
                        getMyLocation((location) => {
                            if (mapFunctionRef?.current) {
                                mapFunctionRef.current.panTo?.([location[0], location[1]], { animate: false })
                            }

                            const currentQuery =
                                typeof window !== 'undefined'
                                    ? new URLSearchParams(window.location.search)
                                    : new URLSearchParams(searchParams)
                            const newUrl = new URLSearchParams(currentQuery)
                            newUrl.set('point', `${location[0]},${location[1]}`)
                            newUrl.delete('activePoint')
                            newUrl.delete('group')
                            newUrl.delete('init')
                            const nextQuery = newUrl.toString()
                            if (nextQuery !== currentQuery.toString()) {
                                router.push(`?${nextQuery}`, { scroll: false })
                            }
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
                            className="w-12 h-12"
                        >
                            <PiMagnifyingGlassPlusFill className="text-2xl" />
                        </RoundIconButton>

                        <RoundIconButton
                            onClick={() => mapFunctionRef?.current?.zoomOut(2)}
                            side="top"
                            label="Zoom ut"
                            className="w-12 h-12"
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