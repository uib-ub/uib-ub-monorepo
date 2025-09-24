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
    const [startTouchX, setStartTouchX] = useState(0)
    const [, setDrawerSwipeDirection] = useState<null | 'up' | 'down'>(null)
    const scrollableContent = useRef<HTMLDivElement>(null)
    // Configure the collapsed drawer height in rem
    const COLLAPSED_HEIGHT_REM = 10.5
    const svhToRem = (svh: number) => {
        if (typeof window === 'undefined' || typeof document === 'undefined') return 0
        const windowHeight = window.visualViewport?.height || window.innerHeight
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
        return ((svh / 100) * windowHeight) / rootFontSize
    }
    const maxRem = () => svhToRem(60)
    const approximately = (a: number, b: number, epsilon = 0.5) => Math.abs(a - b) < epsilon
    const atMax = () => {
        if (typeof window === 'undefined') return false
        const max = maxRem()
        return approximately(snappedPosition, max) && approximately(currentPosition, max)
    }
    const isScrolling = (target: EventTarget) => {
        if (atMax() && target instanceof Node && scrollableContent.current?.contains(target)) {
            return scrollableContent.current.scrollTop != 0
        }
    }
    const isScrollable = () => {
        if (scrollableContent.current) {
            return scrollableContent.current.scrollHeight > scrollableContent.current.clientHeight
        }
        return false
    }

    const { neighbours } = useIIIFNeighbours(manifest?.order, manifest?.partOf)

    const pos2rem = (yPos: number) => {
        const windowHeight = (typeof window !== 'undefined' && (window.visualViewport?.height || window.innerHeight)) || 0
        const max = maxRem()
        return windowHeight ? ((windowHeight - yPos) / windowHeight) * max : 0
    }

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.target && isScrolling(e.target)) {
            return
        }
        setStartTouchY(e.touches[0].clientY)
        setStartTouchX(e.touches[0].clientX)
        setSnapped(false)
    }

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.target && isScrolling(e.target)) {
            return
        }
        const endTouchY = e.changedTouches[0].clientY
        const endTouchX = e.changedTouches[0].clientX
        const isHorizontalSwipe = Math.abs(startTouchX - endTouchX) > Math.abs(startTouchY - endTouchY)
        if (!isHorizontalSwipe) {
            e.preventDefault()
        }
        setSnapped(true)
        const swipeDistance = startTouchY - endTouchY
        let newPosition = currentPosition
        if (Math.abs(swipeDistance) > 30) {
            newPosition = swipeDistance > 0 ? maxRem() : COLLAPSED_HEIGHT_REM
        } else {
            const mid = (COLLAPSED_HEIGHT_REM + maxRem()) / 2
            newPosition = currentPosition < mid ? COLLAPSED_HEIGHT_REM : maxRem()
        }
        if (newPosition < COLLAPSED_HEIGHT_REM) {
            // Clamp to minimum visible height (not dismissable)
            newPosition = COLLAPSED_HEIGHT_REM
        } else if (newPosition > maxRem()) {
            newPosition = maxRem()
        }
        setCurrentPosition(newPosition)
        setSnappedPosition(newPosition)
        setDrawerSwipeDirection(null)
    }

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.target && isScrolling(e.target)) {
            return
        }
        const isHorizontalSwipe = Math.abs(startTouchX - e.touches[0].clientX) > Math.abs(startTouchY - e.touches[0].clientY)
        if (!isHorizontalSwipe) {
            e.preventDefault()
        } else {
            return
        }
        const newHeight = snappedPosition - pos2rem(startTouchY) + pos2rem(e.touches[0].clientY)
        setDrawerSwipeDirection(newHeight > currentPosition ? 'up' : 'down')
        // Allow dragging below 30svh to signal closing; we'll clamp in end handler
        const clamped = Math.max(COLLAPSED_HEIGHT_REM, Math.min(maxRem(), newHeight))
        setCurrentPosition(clamped)
    }

    // Initialize to minimum visible position; drawer is not dismissable in IIIF
    useEffect(() => {
        setSnappedPosition(COLLAPSED_HEIGHT_REM)
        setCurrentPosition(COLLAPSED_HEIGHT_REM)
    }, [setSnappedPosition, setCurrentPosition])

    const open = true
    

    return (
        <div
            className={`mobile-interface fixed w-full left-0 drawer ${snapped ? 'transition-[height] duration-300 ease-in-out' : ''} flex flex-col`}
            style={{ bottom: '-0.5rem', height: `${open ? currentPosition : 0}rem`, pointerEvents: open ? 'auto' : 'none', zIndex: 6000, overscrollBehavior: 'none' as any, overscrollBehaviorY: 'contain' as any, touchAction: 'none' }}
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
                        className={`bg-white border-t border-neutral-200 flex-1 min-h-0 stable-scrollbar overscroll-contain`}
                        style={{ overflowY: atMax() ? 'auto' : 'hidden', touchAction: (atMax() && isScrollable()) ? 'pan-y' : 'none', overscrollBehaviorY: 'contain' as any }}
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


