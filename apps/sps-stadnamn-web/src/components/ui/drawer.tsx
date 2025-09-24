'use client'
import { useLayoutEffect, useRef, useState } from "react"

interface DrawerProps {
    children: React.ReactNode
    drawerOpen: boolean
    setDrawerOpen: (open: boolean) => void
    snappedPosition: number
    currentPosition: number
    setSnappedPosition: (position: number) => void
    setCurrentPosition: (position: number) => void
    collapsedHeightRem?: number
    maxHeightSvh?: number,
    scrollContainerRef?: React.RefObject<HTMLDivElement>
}

export default function Drawer({
    children,
    drawerOpen,
    setDrawerOpen,
    snappedPosition,
    currentPosition,
    setSnappedPosition,
    setCurrentPosition,
    collapsedHeightRem = 12,
    maxHeightSvh = 60,
    scrollContainerRef
}: DrawerProps) {

    const [snapped, setSnapped] = useState(false)
    const [startTouchY, setStartTouchY] = useState(0)
    const [startTouchX, setStartTouchX] = useState(0)
    const [startTouchTime, setStartTouchTime] = useState(0)
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
    const atMax = () => {
        if (typeof window === 'undefined') return false
        const max = maxRem()
        return approximately(snappedPosition, max) && approximately(currentPosition, max)
    }
    const atSnappedMax = () => {
        if (typeof window === 'undefined') return false
        const max = maxRem()
        return approximately(snappedPosition, max)
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
        if (!snappedPosition && !currentPosition) {
            setSnappedPosition(collapsedHeightRem)
            setCurrentPosition(collapsedHeightRem)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (e.target && isScrolling(e.target)) {
            return
        }
        // Block viewport pull-to-refresh at gesture start unless fully open and scrollable
        if (typeof e.cancelable !== 'undefined' && e.cancelable && !(atMax() && isScrollable())) {
            e.preventDefault()
        }
        setStartTouchY(e.touches[0].clientY)
        setStartTouchX(e.touches[0].clientX)
        setSnapped(false)
        setStartTouchTime(Date.now())
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
        const swipeDistance = startTouchY - endTouchY
        const durationMs = Math.max(1, Date.now() - startTouchTime)
        const velocity = swipeDistance / durationMs // px per ms; negative = down
        let newPosition = currentPosition
        if (Math.abs(swipeDistance) > 30) {
            newPosition = swipeDistance > 0 ? maxRem() : collapsedHeightRem
        } else {
            const mid = (collapsedHeightRem + maxRem()) / 2
            newPosition = currentPosition < mid ? collapsedHeightRem : maxRem()
        }
        const pulledBelowThreshold = lastRawHeightRef.current < (collapsedHeightRem - 1)
        const fastDownFromCollapsed = velocity < -0.6 && currentPosition <= (collapsedHeightRem + 1)
        const longDownDragNearCollapsed = (endTouchY - startTouchY) > 60 && currentPosition <= (collapsedHeightRem + 0.5)
        if (newPosition < collapsedHeightRem || pulledBelowThreshold || fastDownFromCollapsed || longDownDragNearCollapsed) {
            // Dismiss but preserve current/snapped positions so reopen restores previous height
            setDrawerOpen(false)
            return
        } else if (newPosition > maxRem()) {
            newPosition = maxRem()
        }
        setCurrentPosition(newPosition)
        setSnappedPosition(newPosition)
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
        const rawNewHeight = snappedPosition - pos2rem(startTouchY) + pos2rem(e.touches[0].clientY)
        lastRawHeightRef.current = rawNewHeight
        const clamped = Math.max(0, Math.min(maxRem(), rawNewHeight))
        setCurrentPosition(clamped)
    }

    return (
        <div
            ref={outerRef}
            className={`fixed w-full left-0 ${!drawerOpen ? 'hidden' : ''} drawer ${snapped ? 'transition-[height] duration-300 ease-in-out' : ''} flex flex-col`}
            style={{ bottom: '-0.5rem', height: `${drawerOpen ? currentPosition : 0}rem`, pointerEvents: drawerOpen ? 'auto' : 'none', zIndex: 6000, touchAction: 'none', overscrollBehaviorY: 'none' as any }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Grip */}
            <div className="w-full h-4 pt-2 rounded-t-full bg-white relative border-b border-neutral-200" style={{ touchAction: 'none' }}>
                <div className="absolute -translate-x-1/2 -translate-y-1 left-1/2 w-16 h-1.5 bg-neutral-200 rounded-full"></div>
            </div>
            {/* Optional internal scroll container if consumer did not provide one */}
            <div
                ref={effectiveScrollRef}
                className="flex-1 min-h-0"
                style={{ overflowY: atMax() ? 'auto' : 'hidden', touchAction: (atMax() && isScrollable()) ? 'pan-y' : 'none', overscrollBehaviorY: 'contain' as any }}
            >
                {children}
            </div>
        </div>
    )
}
