'use client'
import { useEffect, useRef, useState } from "react"
import { PiCaretUpBold } from "react-icons/pi"
import { RoundIconButton } from "./clickable/round-icon-button"
import { MAP_DRAWER_BOTTOM_HEIGHT_REM, MAP_DRAWER_MAX_HEIGHT_SVH, MAP_DRAWER_TOP_SUBTRACT_REM } from "@/lib/map-utils"
import useSearchData from "@/state/hooks/search-data"



export default function Drawer({
    children,
    drawerOpen,
    dismissable,
    setDrawerOpen,
    snappedPosition,
    setSnappedPosition,
    currentPosition,
    setCurrentPosition,
    bottomHeightRem = MAP_DRAWER_BOTTOM_HEIGHT_REM,
    middleHeightSvh = MAP_DRAWER_MAX_HEIGHT_SVH,
    topSubtractRem = MAP_DRAWER_TOP_SUBTRACT_REM,
    scrollContainerRef
}: {
    children: React.ReactNode
    drawerOpen: boolean,
    dismissable: boolean,
    setDrawerOpen: (open: boolean) => void
    snappedPosition: 'bottom' | 'middle' | 'top'
    setSnappedPosition: (position: 'bottom' | 'middle' | 'top') => void
    currentPosition: number
    setCurrentPosition: (position: number) => void
    bottomHeightRem?: number
    middleHeightSvh?: number,
    topSubtractRem?: number,
    scrollContainerRef?: React.RefObject<HTMLDivElement>
}) {

    const [snapped, setSnapped] = useState(false)
    const startTouchY = useRef(0)
    const startTouchX = useRef(0)
    const startTouchTime = useRef(0)
    const dragFromTopZoneRef = useRef(false)
    
    const lastRawHeightRef = useRef<number>(0)
    const startHeightRemRef = useRef<number>(0)
    const localScrollRef = useRef<HTMLDivElement>(null)
    const outerRef = useRef<HTMLDivElement>(null)
    const effectiveScrollRef = scrollContainerRef || localScrollRef
    const gestureStartedScrollRef = useRef<boolean>(false)

    

    const svhToRem = (svh: number) => {
        if (typeof window === 'undefined' || typeof document === 'undefined') return 0
        const windowHeight = window.visualViewport?.height || window.innerHeight
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
        return ((svh / 100) * windowHeight) / rootFontSize
    }
    const middleRem = () => svhToRem(middleHeightSvh)
    const viewportRem = () => {
        if (typeof window === 'undefined' || typeof document === 'undefined') return 0
        const windowHeight = window.visualViewport?.height || window.innerHeight
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
        return windowHeight / rootFontSize
    }
    const topRem = () => Math.max(0, viewportRem() - topSubtractRem) // reduce top height by topSubtractRem
    const approximately = (a: number, b: number, epsilon = 0.5) => Math.abs(a - b) < epsilon
    const snappedPositionRem = () => {
        if (snappedPosition === 'top') return topRem()
        if (snappedPosition === 'middle') return middleRem()
        return bottomHeightRem
    }
    const atMiddle = () => {
        if (typeof window === 'undefined') return false
        const middle = middleRem()
        return snappedPosition === 'middle' && approximately(currentPosition, middle)
    }
    const atTop = () => {
        if (typeof window === 'undefined') return false
        return snappedPosition === 'top' && approximately(currentPosition, topRem())
    }
    

    const isInteractiveElement = (target: EventTarget | null): boolean => {
        return target instanceof Element && !!target.closest('a,button,input,textarea,select,[role="button"],[data-allow-touch]')
    }

    const isScrollable = (): boolean => {
        if (effectiveScrollRef.current) {
            return effectiveScrollRef.current.scrollHeight > effectiveScrollRef.current.clientHeight
        }
        return false
    }

    const shouldAllowScroll = (): boolean => {
        return (atMiddle() || atTop()) && isScrollable()
    }

    const pos2rem = (yPos: number) => {
        const windowHeight = (typeof window !== 'undefined' && (window.visualViewport?.height || window.innerHeight)) || 0
        const middle = middleRem()
        return windowHeight ? ((windowHeight - yPos) / windowHeight) * middle : 0
    }

    // Initialize to collapsed bottom height if unset
    useEffect(() => {
        if (!currentPosition) {
            setCurrentPosition(bottomHeightRem)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // currentPosition is controlled by parent; siblings should observe it there

    // When external snappedPosition changes, open drawer at that snap and update current height
    useEffect(() => {
        const target = snappedPositionRem()
        if (target && approximately(currentPosition, target) === false) {
            setCurrentPosition(target)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [snappedPosition])

    // Simplified: rely solely on component handlers for gestures

    // Ensure opening animates from 0 to the saved snapped height
    useEffect(() => {
        if (drawerOpen) {
            setSnapped(true)
        }
    }, [drawerOpen])

    // Auto-scroll content to top when collapsed
    useEffect(() => {
        if (snappedPosition === 'bottom' && effectiveScrollRef.current) {
            effectiveScrollRef.current.scrollTo({ top: 0, behavior: 'auto' })
        }
    }, [snappedPosition, effectiveScrollRef])

    // Disable viewport overscroll (prevents Chrome pull-to-refresh) while drawer is open
    useEffect(() => {
        if (typeof document === 'undefined') return
        const html = document.documentElement
        const previous = html.style.overscrollBehaviorY
        if (drawerOpen) {
            html.style.overscrollBehaviorY = 'none'
        } else {
            html.style.overscrollBehaviorY = previous || ''
        }
        return () => { html.style.overscrollBehaviorY = previous }
    }, [drawerOpen])

    // Dismiss on outside click/touch
    useEffect(() => {
        if (!drawerOpen) return
        const handlePointerDown = (e: MouseEvent | TouchEvent) => {
            const container = outerRef.current
            if (!container) return
            const target = e.target as Node
            if (!container.contains(target)) {
                if (snappedPosition == 'middle') {
                  setSnappedPosition('bottom')
                }

            }
        }
        document.addEventListener('mousedown', handlePointerDown)
        document.addEventListener('touchstart', handlePointerDown)
        return () => {
            document.removeEventListener('mousedown', handlePointerDown)
            document.removeEventListener('touchstart', handlePointerDown)
        }
    }, [drawerOpen, setDrawerOpen, setSnappedPosition, snappedPosition])

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        startTouchY.current = e.touches[0].clientY
        startTouchX.current = e.touches[0].clientX
        setSnapped(false)
        startTouchTime.current = Date.now()
        startHeightRemRef.current = currentPosition
        gestureStartedScrollRef.current = false
        // Detect if touch starts in the top zone (grip area)
        const containerTop = outerRef.current?.getBoundingClientRect().top || 0
        const gripZoneRem = 2.5 // ~40px at 16px base
        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
        const gripZonePx = gripZoneRem * rootFontSize
        dragFromTopZoneRef.current = (startTouchY.current - containerTop) <= gripZonePx
        // Rely on CSS touch-action/overscroll-behavior instead of preventDefault
    }

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        const endTouchY = e.changedTouches[0].clientY
        const swipeDistance = startTouchY.current - endTouchY
        const isClick = Math.abs(swipeDistance) < 10

        if (isInteractiveElement(e.target) && isClick) {
            return
        }

        // If this gesture initiated scrolling, do not move or snap the drawer on release
        if (gestureStartedScrollRef.current) {
            gestureStartedScrollRef.current = false
            return
        }

        setSnapped(true)
        const pulledBelowThreshold = lastRawHeightRef.current < (bottomHeightRem - 1)
        if (dismissable && pulledBelowThreshold) {
            setCurrentPosition(snappedPositionRem())
            setDrawerOpen(false)
            return
        }

        // Only apply swipe-based snapping based on nearest allowed snap, do not block by direction
        const durationMs = Math.max(1, Date.now() - startTouchTime.current)
        const isSwipeUp = swipeDistance > 0

        const allowTop = dragFromTopZoneRef.current
        const candidates = allowTop
            ? [bottomHeightRem, middleRem(), topRem()]
            : [bottomHeightRem, middleRem()]

        let snapTarget: number
        // Guard: from top without grip, an upward swipe must never reduce size (stay at top)
        if (snappedPosition === 'top' && !allowTop && isSwipeUp) {
            snapTarget = topRem()
        } else if (durationMs < 200 && Math.abs(swipeDistance) > 10) {
            // Quick swipe handling: be conservative about skipping the middle when there is scrollable content.
            if (isSwipeUp) {
                const el = effectiveScrollRef.current
                const scrollTop = el?.scrollTop || 0
                const canScrollDown = !!el && (el.scrollHeight - el.clientHeight - scrollTop) > 1

                // Allow quick snap to top only if:
                // - gesture started in grip, or
                // - there is no more content to scroll down, or
                // - we're currently at bottom (allow skipping straight to top)
                if (dragFromTopZoneRef.current || !canScrollDown || snappedPosition === 'bottom') {
                    snapTarget = topRem()
                } else {
                    snapTarget = middleRem()
                }
            } else {
                // Down: quick swipe down snaps to bottom
                snapTarget = bottomHeightRem
            }
        } else {
            // Slow drag: choose nearest among allowed
            snapTarget = candidates.reduce((prev, curr) => Math.abs(curr - currentPosition) < Math.abs(prev - currentPosition) ? curr : prev)
        }

        if (!dismissable && snapTarget < bottomHeightRem) snapTarget = bottomHeightRem
        setCurrentPosition(snapTarget)
        setSnappedPosition(
            snapTarget === bottomHeightRem ? 'bottom' :
            snapTarget === middleRem() ? 'middle' : 'top'
        )
        gestureStartedScrollRef.current = false
    }

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        const isHorizontal = Math.abs(startTouchX.current - e.touches[0].clientX) > Math.abs(startTouchY.current - e.touches[0].clientY)
        if (isHorizontal) return

        const el = effectiveScrollRef.current
        const canScrollContext = ((snappedPosition === 'middle') || (snappedPosition === 'top')) && isScrollable()
        const scrollTop = el?.scrollTop || 0
        const canScrollUp = !!el && scrollTop > 0
        const canScrollDown = !!el && (el.scrollHeight - el.clientHeight - scrollTop) > 1
        const deltaY = startTouchY.current - e.touches[0].clientY // >0 means moving up

        const inGrip = dragFromTopZoneRef.current
        const atMiddleNow = snappedPosition === 'middle'
        const atTopNow = snappedPosition === 'top'
        const atBottomNow = snappedPosition === 'bottom'

        // If a gesture began with scrolling, never switch to resizing until next touchstart
        if (!inGrip && gestureStartedScrollRef.current) {
            return
        }

        // Grip zone: no scrolling, always resize within clamps
        if (!inGrip) {
            // Not in grip: follow behavior rules per snap position
            if (atBottomNow) {
                // Bottom: no scroll; only allow upward resize
                if (deltaY <= 0) return
            } else if (atMiddleNow) {
                if (deltaY > 0) {
                    // Middle: swipe/drag up -> scroll down if possible, otherwise do nothing
                    if (canScrollContext && canScrollDown) return
                    return
                } else if (deltaY < 0) {
                    // Middle: swipe/drag down -> scroll up if scrolled, otherwise resize toward bottom
                    if (canScrollContext && canScrollUp) { gestureStartedScrollRef.current = true; return }
                    // else fall through to resize
                } else {
                    return
                }
            } else if (atTopNow) {
                if (deltaY > 0) {
                    // Top: swipe/drag up -> scroll if scrollable
                    if (canScrollContext && canScrollDown) return
                    return
                } else if (deltaY < 0) {
                    // Top: swipe/drag down -> scroll if content is scrolled, otherwise resize toward middle
                    if (canScrollContext && canScrollUp) { gestureStartedScrollRef.current = true; return }
                    // else fall through to resize
                } else {
                    return
                }
            }
            // If between snaps, we treat as resizing and continue below
        }
        // Do not call preventDefault here; touch-action controls native behavior

        const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
        const deltaRem = (startTouchY.current - e.touches[0].clientY) / rootFontSize
        const rawNewHeight = startHeightRemRef.current + deltaRem
        lastRawHeightRef.current = rawNewHeight
        const minClamp = dismissable ? 0 : bottomHeightRem
        const maxClamp = topRem()
        const clamped = Math.max(minClamp, Math.min(maxClamp, rawNewHeight))
        setCurrentPosition(clamped)
    }

    // Track scroll position for UI feedback
    const [scrolled, setScrolled] = useState(false)
    const [showScrollToTop, setShowScrollToTop] = useState(false)
    
    useEffect(() => {
        const el = effectiveScrollRef.current
        if (!el) return
        
        const onScroll = () => {
            const scrollTop = el.scrollTop
            setScrolled(scrollTop > 0)
            setShowScrollToTop(scrollTop > 300)
        }
        
        el.addEventListener('scroll', onScroll, { passive: true } as any)
        onScroll() // Initialize on mount
        
        return () => {
            el.removeEventListener('scroll', onScroll as any)
        }
    }, [effectiveScrollRef])

    const scrollToTop = () => {
        if (effectiveScrollRef.current) {
            effectiveScrollRef.current.scrollTo({ top: 0, behavior: 'auto' })
        }
    }

    return (
        <>
        {snappedPosition == 'top' && <div className="absolute top-14 left-0 w-full h-full bg-black/50 z-[3001]"></div>}
        <div
            ref={outerRef}
            className={`fixed w-full left-0 drawer ${snapped ? 'transition-[height] duration-300 ease-in-out' : ''} flex flex-col`}
            style={{ bottom: '-0.5rem', height: `${drawerOpen ? currentPosition : 0}rem`, pointerEvents: drawerOpen ? 'auto' : 'none', zIndex: 6000, touchAction: atMiddle() ? 'auto' : 'none', overscrollBehaviorY: 'none' as any }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Grip */}
            <div
                className={`absolute top-0 left-1/2 -translate-x-1/2 order-b border-none border-primary-600 flex z-[6001] pb-5 px-4  rounded-b-full  bg-gradient-to-b from-white via-white/75 to-transparent`}
            >
           
                <div  className={`${scrolled ? 'bg-neutral-600' : 'bg-neutral-300'} w-16 h-1.5 rounded-full m-1`}></div>

            </div>
            {/* Scroll container: scrollable if the drawer is at the max height */}
            <div
                ref={effectiveScrollRef}
                className={`flex-1 min-h-0 bg-white ${currentPosition > bottomHeightRem ? 'rounded-t-xl' : ''}`}
                style={{ 
                    overflowY: (atMiddle() || atTop()) ? 'auto' : 'hidden', 
                    touchAction: shouldAllowScroll() ? 'pan-y' : 'none', 
                    overscrollBehaviorY: 'contain' as any 
                }}
            >
                {children}
            </div>
            {showScrollToTop && (
                <RoundIconButton
                    type="button"
                    className="absolute right-6 bottom-10 z-[6001] rounded-full"
                    onClick={scrollToTop}
                    label="Til toppen"
                ><PiCaretUpBold className="text-xl xl:text-base"/></RoundIconButton>
            )}
        </div>
        </>
    )
}