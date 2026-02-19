import { getMyLocation, MAP_DRAWER_BOTTOM_HEIGHT_REM, MAP_DRAWER_MAX_HEIGHT_SVH } from "@/lib/map-utils"
import useSearchData from "@/state/hooks/search-data"
import { GlobalContext } from "@/state/providers/global-provider"
import { useSessionStore } from "@/state/zustand/session-store"
import { useContext } from "react"
import { PiCube, PiFunnel, PiFunnelFill, PiGpsFix, PiInfoFill, PiMagnifyingGlassMinusFill, PiMagnifyingGlassPlusFill, PiStackPlus } from "react-icons/pi"
import { RoundIconButton, RoundIconClickable } from "../ui/clickable/round-icon-button"
import { useRouter, useSearchParams } from "next/navigation"


import { useOverlayParams } from "@/lib/param-hooks"
import { useSearchQuery } from "@/lib/search-params"
import { TitleBadge } from "../ui/badge"

export function FilterButton() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const treeSavedQuery = useSessionStore((s) => s.treeSavedQuery)
    const clearTreeSavedQuery = useSessionStore((s) => s.clearTreeSavedQuery)
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition)
    const { facetFilters, datasetFilters } = useSearchQuery()
    const filterCount = facetFilters.length + datasetFilters.length
    const { options } = useOverlayParams()

    return (
        <RoundIconButton
            className={`relative ${options ? 'bg-accent-800 text-white' : ''}`}
            label="Filter"
            aria-controls="options-panel"
            aria-expanded={options}
            onClick={() => {
                setSnappedPosition('middle')

                // If tree view is active, exit tree while restoring stored params (if any),
                // then open the options panel.
                const base = treeSavedQuery != null
                    ? new URLSearchParams(treeSavedQuery)
                    : new URLSearchParams(searchParams)

                base.delete('tree')
                base.set('options', 'on')
                router.replace(`?${base.toString()}`)

                if (treeSavedQuery != null) {
                    clearTreeSavedQuery()
                }
            }}
        >
            {options ? <PiFunnelFill className="text-2xl" /> : <PiFunnel className="text-2xl" />}
            {filterCount > 0 && (
                <TitleBadge
                    count={filterCount}
                    className={`text-xs absolute bottom-1.5 right-1.5 ${options ? 'bg-white border border-accent-800 text-accent-800' : 'bg-primary-700 text-white'}`}
                />
            )}
        </RoundIconButton>
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
    const { mapSettings } = useOverlayParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const hasCam = !!searchParams.get('cam')

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
                    <PiInfoFill className="inline text-xl" /> Ingen treff med koordinater
                </div>

            }
            <div
                className={`flex gap-2 absolute lg: z-[5000] ${isMobile ? 'right-3 flex-col' : 'right-[calc(25svw+1rem)]'}`}
                style={{
                    top: isMobile ? currentPosition <= MAP_DRAWER_BOTTOM_HEIGHT_REM ? "4rem" : `${4 - currentPosition + MAP_DRAWER_BOTTOM_HEIGHT_REM}rem` : "0.5rem",
                }}
            >
                {!isMobile && (
                    <FilterButton />
                )}
                <RoundIconClickable
                    className={`${mapSettings ? 'bg-accent-800 text-white' : ''}`}
                    aria-controls="map-settings-panel"
                    aria-expanded={mapSettings}
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
                        <RoundIconButton
                            onClick={() => {
                                const base = new URLSearchParams(searchParams)
                                const camParam = base.get('cam')
                                const map = (mapFunctionRef?.current as any)?._map ?? mapFunctionRef?.current
                                const applyTilt = (lat: number, lng: number, zoom: number) => {
                                    if (map && typeof map.easeTo === 'function') {
                                        map.easeTo({ center: [lng, lat], zoom, pitch: 60, bearing: 0 })
                                    }
                                }
                                const clearTilt = (lat: number, lng: number, zoom: number) => {
                                    if (map && typeof map.easeTo === 'function') {
                                        map.easeTo({ center: [lng, lat], zoom, pitch: 0, bearing: 0 })
                                    }
                                }
                                if (camParam) {
                                    // Turn 3D off: use live map center/zoom and drop cam.
                                    let center: [number, number] | undefined
                                    let zoom: number | undefined
                                    if (map && typeof map.getCenter === 'function' && typeof map.getZoom === 'function') {
                                        const c = map.getCenter()
                                        const z = map.getZoom()
                                        if (c && typeof c.lat === 'number' && typeof c.lng === 'number') {
                                            center = [c.lat, c.lng]
                                        }
                                        if (typeof z === 'number') zoom = z
                                    }
                                    if (!center) {
                                        const urlCenter = searchParams.get('center')
                                            ? (searchParams.get('center')!.split(',').map(parseFloat) as [number, number])
                                            : undefined
                                        if (urlCenter) center = urlCenter
                                    }
                                    if (typeof zoom !== 'number') {
                                        zoom = searchParams.get('zoom') ? parseFloat(searchParams.get('zoom')!) : undefined
                                    }
                                    if (center) {
                                        base.set('center', `${center[0]},${center[1]}`)
                                    }
                                    if (typeof zoom === 'number') {
                                        base.set('zoom', String(zoom))
                                    }
                                    base.delete('cam')
                                    if (center && typeof zoom === 'number') {
                                        clearTilt(center[0], center[1], zoom)
                                    }
                                } else {
                                    // Turn 3D on: derive cam solely from live map camera.
                                    if (!map || typeof map.getCenter !== 'function' || typeof map.getZoom !== 'function') {
                                        // If the map isn't ready, don't change camera or URL.
                                        return
                                    }
                                    const c = map.getCenter()
                                    const z = map.getZoom()
                                    if (!c || typeof c.lat !== 'number' || typeof c.lng !== 'number' || typeof z !== 'number') {
                                        return
                                    }
                                    const lat = c.lat
                                    const lng = c.lng
                                    const zoom = z
                                    let bounds: { north: number; west: number; south: number; east: number } | null = null
                                    if (typeof map.getBounds === 'function') {
                                        const b = map.getBounds()
                                        if (b && typeof b.getNorth === 'function' && typeof b.getWest === 'function') {
                                            bounds = {
                                                north: b.getNorth(),
                                                west: b.getWest(),
                                                south: b.getSouth(),
                                                east: b.getEast(),
                                            }
                                        }
                                    }
                                    const payload = {
                                        v: 1,
                                        mode: 'center' as const,
                                        center: [lat, lng] as [number, number],
                                        zoom,
                                        bearing: 0,
                                        pitch: 60,
                                        bounds: bounds
                                            ? ([[bounds.north, bounds.west], [bounds.south, bounds.east]] as [[number, number], [number, number]])
                                            : undefined,
                                    }
                                    const json = JSON.stringify(payload)
                                    const camValue = btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
                                    base.set('cam', camValue)
                                    base.delete('zoom')
                                    base.delete('center')
                                    applyTilt(lat, lng, zoom)
                                }
                                router.replace(`?${base.toString()}`)
                            }}
                            side="top"
                            label="3D-modus"
                            className={hasCam ? 'bg-accent-800 text-white' : ''}
                        >
                            <PiCube className="text-2xl" />
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
                {isMobile && (
                    <FilterButton />
                )}
            </div>
        </>
    )
}