'use client'
import { useEffect, useRef, useState } from "react"
import { PiCaretUpBold } from "react-icons/pi"
import { RoundIconButton } from "./clickable/round-icon-button"



export default function Drawer({
    children,
    drawerOpen,
    dismissable,
    setDrawerOpen,
    snappedPosition,
    setSnappedPosition,
    currentPosition,
    setCurrentPosition,
    bottomHeightRem = 8,
    middleHeightSvh = 60,
    topHeightRem = 20,
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
    topHeightRem?: number,
    scrollContainerRef?: React.RefObject<HTMLDivElement>
}) {

    const [snapped, setSnapped] = useState(false)
    const startTouchY = useRef(0)
    const startTouchX = useRef(0)
    const startTouchTime = useRef(0)
    const dragFromTopZoneRef = useRef(false)
    
    const lastRawHeightRef = useRef<number>(0)
    const localScrollRef = useRef<HTMLDivElement>(null)
    const outerRef = useRef<HTMLDivElement>(null)
    const effectiveScrollRef = scrollContainerRef || localScrollRef
    

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
    const topRem = () => viewportRem() // 100svh expressed in rem
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

        setSnapped(true)
        const pulledBelowThreshold = lastRawHeightRef.current < (bottomHeightRem - 1)
        if (dismissable && pulledBelowThreshold) {
            setCurrentPosition(snappedPositionRem())
            setDrawerOpen(false)
            return
        }

        // Only apply swipe-based snapping if dragging is allowed per current logic and direction
        const durationMs = Math.max(1, Date.now() - startTouchTime.current)
        const el = effectiveScrollRef.current
        const scrollTop = el?.scrollTop || 0
        const canScrollUp = !!el && scrollTop > 0
        const canScrollDown = !!el && (el.scrollHeight - el.clientHeight - scrollTop) > 1
        const isSwipeUp = swipeDistance > 0
        const isSwipeDown = swipeDistance < 0
        const dragAllowedNow = dragFromTopZoneRef.current || (
            !shouldAllowScroll() || (
                (isSwipeDown && !canScrollUp) || (isSwipeUp && !canScrollDown)
            )
        )
        if (!dragAllowedNow) return

        // Prevent switching between top and middle unless drag started in grip
        if (!dragFromTopZoneRef.current) {
            if (snappedPosition === 'top') return
            if (snappedPosition === 'middle' && isSwipeUp) return
        }

        const quickSwipe = durationMs < 500 && Math.abs(swipeDistance) > 10
        const allowTop = dragFromTopZoneRef.current

        let snapTarget: number
        if (quickSwipe) {
            if (isSwipeUp) {
                snapTarget = allowTop ? topRem() : middleRem()
            } else {
                snapTarget = snappedPosition === 'top' ? middleRem() : bottomHeightRem
            }
        } else {
            // Choose nearest among allowed stops
            const candidates = allowTop
                ? [bottomHeightRem, middleRem(), topRem()]
                : [bottomHeightRem, middleRem()]
            snapTarget = candidates.reduce((prev, curr) => Math.abs(curr - currentPosition) < Math.abs(prev - currentPosition) ? curr : prev)
        }

        if (!dismissable && snapTarget < bottomHeightRem) snapTarget = bottomHeightRem
        setCurrentPosition(snapTarget)
        setSnappedPosition(
            snapTarget === bottomHeightRem ? 'bottom' :
            snapTarget === middleRem() ? 'middle' : 'top'
        )
    }

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        const isHorizontal = Math.abs(startTouchX.current - e.touches[0].clientX) > Math.abs(startTouchY.current - e.touches[0].clientY)
        if (isHorizontal) return

        const el = effectiveScrollRef.current
        const canScrollContext = shouldAllowScroll()
        const scrollTop = el?.scrollTop || 0
        const canScrollUp = !!el && scrollTop > 0
        const canScrollDown = !!el && (el.scrollHeight - el.clientHeight - scrollTop) > 1
        const deltaY = startTouchY.current - e.touches[0].clientY // >0 means moving up

        // If content can scroll and we're not dragging from the grip, let native scroll handle it based on direction
        if (!dragFromTopZoneRef.current && canScrollContext) {
            if ((deltaY < 0 && canScrollUp) || (deltaY > 0 && canScrollDown)) return
        }
        // If not dragging from the grip, block upward movement from middle (toward top) and any movement at top
        if (!dragFromTopZoneRef.current) {
            if (snappedPosition === 'top') return
            if (snappedPosition === 'middle' && deltaY > 0) return
        }
        // Do not call preventDefault here; touch-action controls native behavior

        const rawNewHeight = snappedPositionRem() - pos2rem(startTouchY.current) + pos2rem(e.touches[0].clientY)
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
                className={`absolute top-0 left-1/2 -translate-x-1/2 order-b border-none border-primary-600 flex z-[6001] pb-5 px-4 bg-gradient-to-b from-white/90 rounded-t-lg via-white/60 to-transparent ${scrolled ? 'w-full left-0 flex justify-center' : ''} `}
            >
           
                <div  className={`${scrolled ? 'bg-neutral-600' : 'bg-neutral-300'} w-16 h-1.5 rounded-full m-1`}></div>

            </div>
            {/* Scroll container: scrollable if the drawer is at the max height */}
            <div
                ref={effectiveScrollRef}
                className={`flex-1 min-h-0 bg-white ${currentPosition > bottomHeightRem ? 'rounded-t-lg' : ''}`}
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
                    className="absolute right-6 bottom-12 z-[6001] rounded-full"
                    onClick={scrollToTop}
                    label="Til toppen"
                ><PiCaretUpBold className="text-xl xl:text-base"/></RoundIconButton>
            )}
        </div>
    )
}