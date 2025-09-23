'use client'
import { useEffect, useRef, useState } from 'react'
import { useSessionStore } from '@/state/zustand/session-store'
import IIIFInfoSection from './iiif-info-section'
import IconLink from '@/components/ui/icon-link'
import { PiCaretLeftBold, PiCaretLineLeftBold, PiCaretLineRight, PiCaretRightBold } from 'react-icons/pi'
import { useIIIFNeighbours } from '@/state/hooks/use-iiif-neighbours'

export default function IIIFMobileDrawer({ manifest, manifestDataset, stats }: { manifest: any, manifestDataset: string, stats: any }) {

    useSessionStore((s) => s.drawerContent)

    const snappedPosition = useSessionStore((s) => s.snappedPosition)
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition)

    const currentPosition = useSessionStore((s) => s.currentPosition)
    const setCurrentPosition = useSessionStore((s) => s.setCurrentPosition)

    const [snapped, setSnapped] = useState(false)
    const [startTouchY, setStartTouchY] = useState(0)
    const [, setDrawerSwipeDirection] = useState<null | 'up' | 'down'>(null)
    const scrollableContent = useRef<HTMLDivElement>(null)
    const isScrollable = () => {
        if (scrollableContent.current) {
            return scrollableContent.current.scrollHeight > scrollableContent.current.clientHeight
        }
        return false
    }

    const { neighbours } = useIIIFNeighbours(manifest?.order, manifest?.partOf)

    const pos2svh = (yPos: number) => {
        const windowHeight = window.visualViewport?.height || window.innerHeight
        return (windowHeight - yPos) / windowHeight * 60
    }

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        setStartTouchY(e.touches[0].clientY)
        setSnapped(false)
    }

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        setSnapped(true)
        const endTouchY = e.changedTouches[0].clientY
        const swipeDistance = startTouchY - endTouchY
        let newPosition = currentPosition
        if (Math.abs(swipeDistance) > 30) {
            newPosition = swipeDistance > 0 ? 60 : 30
        } else {
            newPosition = currentPosition < 45 ? 30 : 60
        }
        if (newPosition < 30) {
            // Clamp to minimum visible height (not dismissable)
            newPosition = 30
        } else if (newPosition > 60) {
            newPosition = 60
        }
        setCurrentPosition(newPosition)
        setSnappedPosition(newPosition)
        setDrawerSwipeDirection(null)
    }

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        const newHeight = snappedPosition - pos2svh(startTouchY) + pos2svh(e.touches[0].clientY)
        setDrawerSwipeDirection(newHeight > currentPosition ? 'up' : 'down')
        // Allow dragging below 30svh to signal closing; we'll clamp in end handler
        const clamped = Math.max(0, Math.min(60, newHeight))
        setCurrentPosition(clamped)
    }

    // Initialize to minimum visible position; drawer is not dismissable in IIIF
    useEffect(() => {
        setSnappedPosition(30)
        setCurrentPosition(30)
    }, [setSnappedPosition, setCurrentPosition])

    const open = true
    

    return (
        <div
            className={`mobile-interface fixed w-full left-0 drawer ${snapped ? 'transition-[height] duration-300 ease-in-out' : ''}`}
            style={{ bottom: '-0.5rem', height: `${open ? currentPosition : 0}svh`, pointerEvents: open ? 'auto' : 'none', zIndex: 6000, overscrollBehavior: 'none' as any }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            aria-hidden={!open}
        >
            {open && (
                <>
                    <div className="w-full h-4 pt-2 rounded-t-full bg-white relative" style={{ touchAction: 'none' }}>
                        <div className="absolute -translate-x-1/2 -translate-y-1 left-1/2 w-16 h-1.5 bg-neutral-200 rounded-full"></div>
                    </div>
                    <div
                        ref={scrollableContent}
                        className={`bg-white border-t border-neutral-200 h-[calc(100%-1rem)] stable-scrollbar overscroll-contain`}
                        style={{ overflowY: snappedPosition == 60 && currentPosition == 60 ? 'auto' : 'hidden', touchAction: (snappedPosition == 60 && currentPosition == 60 && isScrollable()) ? 'pan-y' : 'none' }}
                    >
                        <div className="p-3">
                            {/* Manifest pager for mobile */}
                            {manifest?.type === 'Manifest' && neighbours?.data && neighbours.total > 1 && (
                                <div className="flex items-center gap-2 w-full pb-3">
                                    <IconLink label="Første element" href={`/iiif/${neighbours.data.first}`} className="btn btn-outline btn-compact !p-2">
                                        <PiCaretLineLeftBold aria-hidden="true" />
                                    </IconLink>
                                    <IconLink label="Forrige element" href={`/iiif/${neighbours.data.previous || neighbours.data.last}`} className="btn btn-outline btn-compact !p-2">
                                        <PiCaretLeftBold aria-hidden="true" />
                                    </IconLink>
                                    <div className="flex-1 text-center px-3 py-1 rounded-sm border-neutral-400">
                                        {manifest.order}/{neighbours.total}
                                    </div>
                                    <IconLink label="Neste element" href={`/iiif/${neighbours.data.next || neighbours.data.first}`} className="btn btn-outline btn-compact !p-2">
                                        <PiCaretRightBold aria-hidden="true" />
                                    </IconLink>
                                    <IconLink label="Siste element" href={`/iiif/${neighbours.data.last}`} className="btn btn-outline btn-compact !p-2">
                                        <PiCaretLineRight aria-hidden="true" />
                                    </IconLink>
                                </div>
                            )}

                            {/* Metadata and info */}
                            <IIIFInfoSection manifest={manifest} manifestDataset={manifestDataset} stats={stats} />
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}


