import ClientThumbnail from "@/components/doc/client-thumbnail"
import ClickableIcon from "@/components/ui/clickable/clickable-icon"
import { datasetTitles } from "@/config/metadata-config"
import { useRef, useState } from "react"
import { PiCaretLeft, PiCaretLeftBold, PiCaretRight, PiCaretRightBold } from "react-icons/pi"

type CarouselItem = { dataset: string, uuid: string, iiif?: string | string[], content?: { text?: string, html?: string } }

export default function Carousel({ items }: { items: CarouselItem[] }) {
    const [currentIndex, setCurrentIndex] = useState<number>(0)

    // Touch/swipe state (minimal)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const widthRef = useRef(0)
    const startXRef = useRef(0)
    const startYRef = useRef(0)
    const lastXRef = useRef(0)
    const gestureRef = useRef<null | 'horizontal' | 'vertical'>(null)
    const movedRef = useRef(0)

    const SWIPE_ACTIVATE_THRESHOLD = 10     // px before deciding direction
    const SWIPE_NAV_THRESHOLD = 40          // px to trigger navigation on release

    // Animation state
    const [dragX, setDragX] = useState(0)
    const [animating, setAnimating] = useState(false)
    const commitDirRef = useRef<null | 'next' | 'prev'>(null)

    const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
        if (e.touches.length !== 1) return
        const t = e.touches[0]
        startXRef.current = t.clientX
        startYRef.current = t.clientY
        lastXRef.current = t.clientX
        gestureRef.current = null
        movedRef.current = 0
        widthRef.current = (e.currentTarget as HTMLDivElement).clientWidth || 0
        setAnimating(false)
        setDragX(0)
    }

    const handleTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
        if (e.touches.length !== 1) return
        const t = e.touches[0]
        const dx = t.clientX - startXRef.current
        const dy = t.clientY - startYRef.current
        lastXRef.current = t.clientX
        movedRef.current = Math.max(movedRef.current, Math.abs(dx))

        if (!gestureRef.current) {
            const absDx = Math.abs(dx)
            const absDy = Math.abs(dy)
            if (absDx > SWIPE_ACTIVATE_THRESHOLD || absDy > SWIPE_ACTIVATE_THRESHOLD) {
                // Decide only when the gesture is clearly in one direction
                if (absDx > absDy + 8) {
                    gestureRef.current = 'horizontal'
                } else if (absDy > absDx + 8) {
                    gestureRef.current = 'vertical'
                }
            }
        }

        if (gestureRef.current === 'horizontal') {
            // Only suppress vertical scrolling after obvious horizontal intent
            e.preventDefault()
            e.stopPropagation()
            setDragX(dx)
        }
    }

    const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = () => {
        const dx = lastXRef.current - startXRef.current
        if (gestureRef.current === 'horizontal') {
            if (dx <= -SWIPE_NAV_THRESHOLD) {
                // commit to next
                if (currentIndex < items.length - 1) {
                    commitDirRef.current = 'next'
                    setAnimating(true)
                    setDragX(-widthRef.current)
                } else {
                    // at end, snap back
                    commitDirRef.current = null
                    setAnimating(true)
                    setDragX(0)
                }
            } else if (dx >= SWIPE_NAV_THRESHOLD) {
                // commit to prev
                if (currentIndex > 0) {
                    commitDirRef.current = 'prev'
                    setAnimating(true)
                    setDragX(widthRef.current)
                } else {
                    // at start, snap back
                    commitDirRef.current = null
                    setAnimating(true)
                    setDragX(0)
                }
            } else {
                // Not enough movement, snap back
                commitDirRef.current = null
                setAnimating(true)
                setDragX(0)
            }
        }
        gestureRef.current = null
    }

    const handleClickCapture: React.MouseEventHandler<HTMLDivElement> = (e) => {
        if (movedRef.current > 6) {
            e.preventDefault()
            e.stopPropagation()
        }
        movedRef.current = 0
    }

    if (!items?.length) {
        return null
    }

    const nextIndex = Math.min(items.length - 1, currentIndex + 1)
    const prevIndex = Math.max(0, currentIndex - 1)

    const handleTransitionEnd: React.TransitionEventHandler<HTMLDivElement> = () => {
        if (commitDirRef.current === 'next') {
            setCurrentIndex((i) => Math.min(items.length - 1, i + 1))
        } else if (commitDirRef.current === 'prev') {
            setCurrentIndex((i) => Math.max(0, i - 1))
        }
        setAnimating(false)
        setDragX(0)
        commitDirRef.current = null
    }

    return (
        <div
            ref={containerRef}
            className="flex flex-row h-64 relative select-none overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClickCapture={handleClickCapture}
        >
            {/* Three-plane layout: prev, current, next absolutely positioned */}
            <div className="absolute inset-0" onTransitionEnd={handleTransitionEnd}>
                {/* Prev */}
                {currentIndex > 0 && (
                    <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                            transform: `translateX(${dragX - (widthRef.current || containerRef.current?.clientWidth || 0)}px)`,
                            transition: animating ? 'transform 250ms ease' : 'none'
                        }}
                    >
                        <ClientThumbnail iiif={items[prevIndex].iiif as any} datasetLabel={items[prevIndex].dataset}/>
                    </div>
                )}

                {/* Current */}
                <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                        transform: `translateX(${dragX}px)`,
                        transition: animating ? 'transform 250ms ease' : 'none'
                    }}
                >
                    <ClientThumbnail iiif={items[currentIndex].iiif as any} datasetLabel={items[currentIndex].dataset}/>
                </div>

                {/* Next */}
                {currentIndex < items.length - 1 && (
                    <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                            transform: `translateX(${dragX + (widthRef.current || containerRef.current?.clientWidth || 0)}px)`,
                            transition: animating ? 'transform 250ms ease' : 'none'
                        }}
                    >
                        <ClientThumbnail iiif={items[nextIndex].iiif as any} datasetLabel={items[nextIndex].dataset}/>
                    </div>
                )}
            </div>
            <div className="absolute bottom-1 left-1 flex gap-1 items-center">
            {items.length > 1 && (
                <div className={`bg-neutral-950/70 flex items-center text-white rounded-full backdrop-blur-sm ${currentIndex > 0 ? 'pr-3' : 'pr-0'} ${currentIndex < items.length - 1 ? 'pl-3' : 'pl-0'} py-1`}>
                    {currentIndex > 0 && <ClickableIcon label="Forrige" className="text-lg pr-1 pl-2" onClick={() => setCurrentIndex(currentIndex - 1)}><PiCaretLeftBold /></ClickableIcon>}
                    {currentIndex + 1}/{items.length}
                    {currentIndex < items.length - 1 && <ClickableIcon label="Neste" className="text-lg pl-1 pr-2" onClick={() => setCurrentIndex(currentIndex + 1)}><PiCaretRightBold /></ClickableIcon>}
                </div>
            )}
            <div className="bg-neutral-950/70 text-white rounded-full backdrop-blur-sm px-3 py-1">{datasetTitles[items[currentIndex].dataset]}</div>

            </div>
        </div>
    )
}