'use client'
import { useLayoutEffect, useRef, useState } from "react"
import { PiCaretUp, PiCaretUpBold } from "react-icons/pi"
import { RoundIconButton } from "./clickable/round-icon-button"

interface DrawerProps {
    children: React.ReactNode
    drawerOpen: boolean
    setDrawerOpen: (open: boolean) => void
    snappedPosition: 'min' | 'max'
    setSnappedPosition: (position: 'min' | 'max') => void
    currentPosition: number
    setCurrentPosition: (position: number) => void
    minHeightRem?: number
    maxHeightSvh?: number,
    scrollContainerRef?: React.RefObject<HTMLDivElement>
}

export default function Drawer({
    children,
    drawerOpen,
    setDrawerOpen,
    snappedPosition,
    setSnappedPosition,
    currentPosition,
    setCurrentPosition,
    minHeightRem = 10,
    maxHeightSvh = 50,
    scrollContainerRef
}: DrawerProps) {

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
    const atSnappedMax = () => {
        if (typeof window === 'undefined') return false
        return snappedPosition === 'max'
    }

    const isScrolling = (target: EventTarget) => {
        if (atSnappedMax() && target instanceof Node && effectiveScrollRef.current?.contains(target)) {
            return effectiveScrollRef.current.scrollTop != 0
        }
    }

    const isScrollable = () => {
        if (effectiveScrollRef.current) {
            return effectiveScrollRef.current.scrollHeight > effectiveScrollRef.current.clientHeight
        }
        return false
    }

    const pos2rem = (yPos: number) => {
        const windowHeight = (typeof window !== 'undefined' && (window.visualViewport?.height || window.innerHeight)) || 0
        const max = maxRem()
        return windowHeight ? ((windowHeight - yPos) / windowHeight) * max : 0
    }

    // Initialize to collapsed bottom height if unset
    useLayoutEffect(() => {
        if (!currentPosition) {
            setCurrentPosition(minHeightRem)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // currentPosition is controlled by parent; siblings should observe it there

    // When external snappedPosition changes, open drawer at that snap and update current height
    useLayoutEffect(() => {
        const target = snappedPositionRem()
        if (target && approximately(currentPosition, target) === false) {
            setCurrentPosition(target)
        }
        if (!drawerOpen) setDrawerOpen(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [snappedPosition])

    // Ensure non-passive touch handlers to allow preventDefault for PTR prevention
    useLayoutEffect(() => {
        const el = outerRef.current
        if (!el) return
        const onStart = (e: TouchEvent) => {
            if (!(atMax() && isScrollable()) && e.cancelable) e.preventDefault()
        }
        const onMove = (e: TouchEvent) => {
            if (!(atMax() && isScrollable()) && e.cancelable) e.preventDefault()
        }
        el.addEventListener('touchstart', onStart, { passive: false })
        el.addEventListener('touchmove', onMove, { passive: false })
        return () => {
            el.removeEventListener('touchstart', onStart as any)
            el.removeEventListener('touchmove', onMove as any)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [snappedPosition, currentPosition])

    // Ensure opening animates from 0 to the saved snapped height
    useLayoutEffect(() => {
        if (drawerOpen) {
            setSnapped(true)
        }
    }, [drawerOpen])

    // Dismiss on outside click/touch
    useLayoutEffect(() => {
        if (!drawerOpen) return
        const handlePointerDown = (e: MouseEvent | TouchEvent) => {
            const container = outerRef.current
            if (!container) return
            const target = e.target as Node
            if (!container.contains(target)) {
                setSnappedPosition('min')
            }
        }
        document.addEventListener('mousedown', handlePointerDown)
        document.addEventListener('touchstart', handlePointerDown)
        return () => {
            document.removeEventListener('mousedown', handlePointerDown)
            document.removeEventListener('touchstart', handlePointerDown)
        }
    }, [drawerOpen, setDrawerOpen, setSnappedPosition])

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.target && isScrolling(e.target)) {
            return
        }
        // Block viewport pull-to-refresh at gesture start unless fully open and scrollable
        if (typeof e.cancelable !== 'undefined' && e.cancelable && !(atMax() && isScrollable())) {
            e.preventDefault()
        }
        startTouchY.current = e.touches[0].clientY
        startTouchX.current = e.touches[0].clientX
        setSnapped(false)
        startTouchTime.current = Date.now()
    }

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.target && isScrolling(e.target)) {
            return
        }
        // Also block PTR at end if gesture wasn't a scroll of inner content
        if (typeof e.cancelable !== 'undefined' && e.cancelable && !(atMax() && isScrollable())) {
            e.preventDefault()
        }
        const endTouchY = e.changedTouches[0].clientY
        setSnapped(true)
        const swipeDistance = startTouchY.current - endTouchY
        const durationMs = Math.max(1, Date.now() - startTouchTime.current)
        const velocity = swipeDistance / durationMs // px per ms; negative = down
        let newPosition = currentPosition
        if (Math.abs(swipeDistance) > 30) {
            newPosition = swipeDistance > 0 ? maxRem() : minHeightRem
        } else {
            const mid = (minHeightRem + maxRem()) / 2
            newPosition = currentPosition < mid ? minHeightRem : maxRem()
        }
        const pulledBelowThreshold = lastRawHeightRef.current < (minHeightRem - 1)
        const fastDownFromCollapsed = velocity < -0.6 && currentPosition <= (minHeightRem + 1)
        const longDownDragNearCollapsed = (endTouchY - startTouchY.current) > 60 && currentPosition <= (minHeightRem + 0.5)
        if (newPosition < minHeightRem || pulledBelowThreshold || fastDownFromCollapsed || longDownDragNearCollapsed) {
            // Dismiss but preserve current/snapped positions so reopen restores previous height
            setCurrentPosition(snappedPositionRem())
            setDrawerOpen(false)
            return
        } else if (newPosition > maxRem()) {
            newPosition = maxRem()
        }
        setCurrentPosition(newPosition)
        const mid = (minHeightRem + maxRem()) / 2
        setSnappedPosition(newPosition < mid ? 'min' : 'max')
    }

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.target && isScrolling(e.target)) {
            return
        }
        const isHorizontalSwipe = Math.abs(startTouchX.current - e.touches[0].clientX) > Math.abs(startTouchY.current - e.touches[0].clientY)
        if (!isHorizontalSwipe) {
            e.preventDefault()
        } else {
            return
        }
        const rawNewHeight = snappedPositionRem() - pos2rem(startTouchY.current) + pos2rem(e.touches[0].clientY)
        lastRawHeightRef.current = rawNewHeight
        const clamped = Math.max(0, Math.min(maxRem(), rawNewHeight))
        setCurrentPosition(clamped)
    }

    // Track if the scroll container is scrolled from top
    const [scrolled, setScrolled] = useState(false)
    const handleScroll = () => {
        const top = effectiveScrollRef.current?.scrollTop || 0
        if ((top > 0) !== scrolled) setScrolled(top > 0)
    }
    useLayoutEffect(() => {
        // Sync when opening or snapping height changes
        handleScroll()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drawerOpen, currentPosition, snappedPosition])

    // Scroll-to-top visibility
    const [showScrollToTop, setShowScrollToTop] = useState(false)
    useLayoutEffect(() => {
        const el = effectiveScrollRef.current
        if (!el) return
        const onScroll = () => {
            setShowScrollToTop(el.scrollTop > 300)
        }
        el.addEventListener('scroll', onScroll, { passive: true } as any)
        onScroll()
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
            <div className={`w-full h-4 pt-2 rounded-t-full bg-white relative ${scrolled ? 'border-b border-neutral-200' : ''}`} style={{ touchAction: 'none' }}>
                <div className="absolute -translate-x-1/2 -translate-y-1 left-1/2 w-16 h-1.5 bg-neutral-200 rounded-full"></div>
            </div>
            {/* Scroll container: scrollable if the drawer is at the max height */}
            <div
                ref={effectiveScrollRef}
                className="flex-1 min-h-0 bg-white"
                style={{ overflowY: atMax() ? 'auto' : 'hidden', touchAction: (atMax() && isScrollable()) ? 'pan-y' : 'none', overscrollBehaviorY: 'contain' as any }}
                onScroll={handleScroll}
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
