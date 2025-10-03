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
    minHeightRem = 8,
    maxHeightSvh = 50,
    scrollContainerRef
}: {
    children: React.ReactNode
    drawerOpen: boolean,
    dismissable: boolean,
    setDrawerOpen: (open: boolean) => void
    snappedPosition: 'min' | 'max'
    setSnappedPosition: (position: 'min' | 'max') => void
    currentPosition: number
    setCurrentPosition: (position: number) => void
    minHeightRem?: number
    maxHeightSvh?: number,
    scrollContainerRef?: React.RefObject<HTMLDivElement>
}) {

    const [snapped, setSnapped] = useState(false)
    const startTouchY = useRef(0)
    const startTouchX = useRef(0)
    const startTouchTime = useRef(0)
    
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
    const maxRem = () => svhToRem(maxHeightSvh)
    const approximately = (a: number, b: number, epsilon = 0.5) => Math.abs(a - b) < epsilon
    const snappedPositionRem = () => snappedPosition === 'max' ? maxRem() : minHeightRem
    const atMax = () => {
        if (typeof window === 'undefined') return false
        const max = maxRem()
        return snappedPosition === 'max' && approximately(currentPosition, max)
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
        return atMax() && isScrollable()
    }

    const pos2rem = (yPos: number) => {
        const windowHeight = (typeof window !== 'undefined' && (window.visualViewport?.height || window.innerHeight)) || 0
        const max = maxRem()
        return windowHeight ? ((windowHeight - yPos) / windowHeight) * max : 0
    }

    // Initialize to collapsed bottom height if unset
    useEffect(() => {
        if (!currentPosition) {
            setCurrentPosition(minHeightRem)
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
        if (snappedPosition === 'min' && effectiveScrollRef.current) {
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
                if (snappedPosition == 'max') {
                  setSnappedPosition('min')
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
        // If at max and content cannot scroll, prevent default early to avoid viewport gestures
        if (e.cancelable && atMax() && !isScrollable()) {
            e.preventDefault()
        }
    }

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        const endTouchY = e.changedTouches[0].clientY
        const swipeDistance = startTouchY.current - endTouchY
        const isClick = Math.abs(swipeDistance) < 10

        if (isInteractiveElement(e.target) && isClick) {
            return
        }

        setSnapped(true)
        const pulledBelowThreshold = lastRawHeightRef.current < (minHeightRem - 1)
        if (dismissable && pulledBelowThreshold) {
            setCurrentPosition(snappedPositionRem())
            setDrawerOpen(false)
            return
        }

        // Only apply swipe-based snapping if dragging is allowed per current logic
        const durationMs = Math.max(1, Date.now() - startTouchTime.current)
        const dragAllowedNow = !(shouldAllowScroll() && (effectiveScrollRef.current?.scrollTop || 0) > 0)
        if (!dragAllowedNow) return

        const quickSwipe = durationMs < 500 && Math.abs(swipeDistance) > 10
        const mid = (minHeightRem + maxRem()) / 2
        let snapTarget = quickSwipe
            ? (swipeDistance > 0 ? maxRem() : minHeightRem)
            : (currentPosition < mid ? minHeightRem : maxRem())
        if (snapTarget > maxRem()) snapTarget = maxRem()
        if (!dismissable && snapTarget < minHeightRem) snapTarget = minHeightRem
        setCurrentPosition(snapTarget)
        setSnappedPosition(snapTarget === minHeightRem ? 'min' : 'max')
    }

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        const isHorizontal = Math.abs(startTouchX.current - e.touches[0].clientX) > Math.abs(startTouchY.current - e.touches[0].clientY)
        if (isHorizontal) return

        const atMaxAndScrollable = shouldAllowScroll()
        const scrollTop = effectiveScrollRef.current?.scrollTop || 0

        // If content can scroll and is not at top, do not drag the drawer
        if (atMaxAndScrollable && scrollTop > 0) return
        if (e.cancelable) e.preventDefault()

        const rawNewHeight = snappedPositionRem() - pos2rem(startTouchY.current) + pos2rem(e.touches[0].clientY)
        lastRawHeightRef.current = rawNewHeight
        const minClamp = dismissable ? 0 : minHeightRem
        const clamped = Math.max(minClamp, Math.min(maxRem(), rawNewHeight))
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
            style={{ bottom: '-0.5rem', height: `${drawerOpen ? currentPosition : 0}rem`, pointerEvents: drawerOpen ? 'auto' : 'none', zIndex: 6000, touchAction: 'none', overscrollBehaviorY: 'none' as any }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Grip */}
            <button onClick={() => setSnappedPosition(snappedPosition == 'min' ? 'max' : 'min')} className={`w-full h-2 flex items-center justify-center pt-2 ${currentPosition > minHeightRem ? 'rounded-t-full' : ''} bg-white relative ${scrolled ? 'border-b border-neutral-200 pb-2' : ''}`} style={{ touchAction: 'none' }}>
                <div className="w-16 h-1.5 bg-neutral-200 rounded-full"></div>
            </button>
            {/* Scroll container: scrollable if the drawer is at the max height */}
            <div
                ref={effectiveScrollRef}
                className="flex-1 min-h-0 bg-white"
                style={{ 
                    overflowY: atMax() ? 'auto' : 'hidden', 
                    touchAction: shouldAllowScroll() ? 'pan-y' : 'none', 
                    overscrollBehaviorY: 'contain' as any 
                }}
            >
                {children}
            </div>
            {showScrollToTop && (
                <RoundIconButton
                    type="button"
                    className="absolute right-3 top-6 z-[6001] rounded-full"
                    onClick={scrollToTop}
                    label="Til toppen"
                ><PiCaretUpBold className="text-xl xl:text-base"/></RoundIconButton>
            )}
        </div>
    )
}