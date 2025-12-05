import ClientThumbnail from "@/components/doc/client-thumbnail"
import ClickableIcon from "@/components/ui/clickable/clickable-icon"
import { datasetTitles } from "@/config/metadata-config"
import { GlobalContext } from "@/state/providers/global-provider"
import { useContext, useRef, useState } from "react"
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi"

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
    const { isMobile } = useContext(GlobalContext)

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
            className="flex flex-row h-28 xl:h-32 2xl:h-48 relative select-none overflow-hidden group w-full bg-neutral-50 p-2"
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
                        <ClientThumbnail iiif={items[prevIndex].iiif as any} datasetLabel={items[prevIndex].dataset} />
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
                    <ClientThumbnail iiif={items[currentIndex].iiif as any} datasetLabel={items[currentIndex].dataset} />
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
                        <ClientThumbnail iiif={items[nextIndex].iiif as any} datasetLabel={items[nextIndex].dataset} />
                    </div>
                )}
            </div>
            <strong className="absolute top-0 left-0 text-sm px-1 text-black bg-white/70 backdrop-blur-sm m-1 py-0 rounded-md">{datasetTitles[items[currentIndex].dataset]}</strong>
            <div className="absolute top-0 right-0 flex gap-0">
                {items.length > 1 && (
                    <div className={`bg-neutral-950/70 flex items-center text-white backdrop-blur-sm text-sm px-2 py-0`}>
                        {currentIndex + 1}/{items.length}
                    </div>
                )}


            </div>
            {!isMobile && currentIndex > 0 && <ClickableIcon label="Forrige"
                className="absolute bg-neutral-950/70 rounded-full text-white text-xl p-2 left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                onClick={() => setCurrentIndex(currentIndex - 1)}>
                <PiCaretLeftBold />
            </ClickableIcon>}
            {!isMobile && currentIndex < items.length - 1 && <ClickableIcon label="Neste"
                className="absolute bg-neutral-950/70 rounded-full text-white p-2 text-xl right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity" onClick={() => setCurrentIndex(currentIndex + 1)}><PiCaretRightBold /></ClickableIcon>}
            {items.length > 1 && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 md:hidden pointer-events-none">
                    <div className="flex items-center gap-1 bg-neutral-950/50 backdrop-blur-sm rounded-full px-2 py-1">
                        {items.map((_, idx) => (
                            <span
                                key={idx}
                                className={`${idx === currentIndex ? 'bg-white' : 'bg-white/60'} h-1.5 w-1.5 rounded-full`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}