'use client'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import DocSkeleton from '@/components/doc/doc-skeleton'
import { stringToBase64Url } from '@/lib/utils'
import useDocData from '@/state/hooks/doc-data'
import { GlobalContext } from '@/app/global-provider'

export default function HorizontalSwipe({
  children,
  scrollRef
}: {
  children: React.ReactNode
  scrollRef?: React.RefObject<HTMLDivElement>
}) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const navigatedRef = useRef(false)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { groupIndex, collapsedResults } = useContext(CollapsedContext)
  const { setHighlightedGroup } = useContext(GlobalContext)

  const [startTouchX, setStartTouchX] = useState(0)
  const [startTouchY, setStartTouchY] = useState(0)
  const [startTouchTime, setStartTouchTime] = useState(0)

  const [swipeDirection, setSwipeDirection] = useState<null | 'left' | 'right'>(null)
  const [currentOffset, setCurrentOffset] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [committed, setCommitted] = useState<null | 'left' | 'right'>(null)
  const { docLoading } = useDocData()

  const prevDoc = groupIndex ? collapsedResults?.[groupIndex - 1] : null
  const nextDoc = groupIndex ? collapsedResults?.[groupIndex + 1] : null

  const [debug, setDebug] = useState({
    touchDuration: 0,
    swipeDistance: 0,
    isQuickSwipe: false,
    isHorizontalSwipe: false
  })


useEffect(() => {
  if (!docLoading) {
    // New doc has finished loading → clear any swipe visual state
    setSwipeDirection(null)
    setCommitted(null)
    setCurrentOffset(0)
    navigatedRef.current = false
  }
}, [docLoading])

  const measureWidth = () => hostRef.current?.offsetWidth || (typeof window !== 'undefined' ? window.innerWidth : 1)

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartTouchX(e.touches[0].clientX)
    setStartTouchY(e.touches[0].clientY)
    setStartTouchTime(Date.now())
    setSwipeDirection(null)
    setIsAnimating(false)
    setCommitted(null)
    navigatedRef.current = false
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const x = e.touches[0].clientX
    const y = e.touches[0].clientY
    if (Math.abs(x - startTouchX) < 8 && Math.abs(y - startTouchY) < 8) return

    const isHorizontal = Math.abs(startTouchX - x) > Math.abs(startTouchY - y)
    if (!isHorizontal) return

    const newOffset = startTouchX - x // >0 left, <0 right
    const swipeDir = newOffset > 0 ? 'left' : 'right'
    
    // Prevent swiping if there's no target document in that direction
    if (swipeDir === 'left' && !nextDoc) return
    if (swipeDir === 'right' && !prevDoc) return

    setCurrentOffset(newOffset)
    setSwipeDirection(swipeDir)

    setDebug(prev => ({ ...prev, isHorizontalSwipe: true, swipeDistance: Math.abs(startTouchX - x) }))
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    const duration = Date.now() - startTouchTime
    const dx = endX - startTouchX
    const absDx = Math.abs(dx)
    const isHorizontal = absDx > Math.abs(endY - startTouchY)
    const width = measureWidth()
    const farEnough = absDx > width * 0.25
    const quickEnough = duration < 400

    setDebug({ touchDuration: duration, swipeDistance: absDx, isQuickSwipe: quickEnough, isHorizontalSwipe: isHorizontal })
    setIsAnimating(true)

    if (!quickEnough || !farEnough || !isHorizontal) {
      setCommitted(null)
      setSwipeDirection(null)
      setCurrentOffset(0)
      return
    }

    const swipeDir = dx > 0 ? 'right' : 'left'
    
    // Additional check: don't commit if there's no target document
    if (swipeDir === 'left' && !nextDoc) {
      setCommitted(null)
      setSwipeDirection(null)
      setCurrentOffset(0)
      return
    }
    if (swipeDir === 'right' && !prevDoc) {
      setCommitted(null)
      setSwipeDirection(null)
      setCurrentOffset(0)
      return
    }

    // Commit visual state; navigation fires on transition end
    setCommitted(swipeDir)
  }

  const width = measureWidth()
  const progress = Math.min(1, Math.max(0, Math.abs(currentOffset) / Math.max(1, width)))

  const leftIncomingX =
    committed === 'right' ? 0 :
    (swipeDirection === 'right' && currentOffset < 0) ? -100 + progress * 100 : -100

  const rightIncomingX =
    committed === 'left' ? 0 :
    (swipeDirection === 'left' && currentOffset > 0) ? 100 - progress * 100 : 100

  const contentTranslate =
    committed === 'left' ? 'translateX(-100%)' :
    committed === 'right' ? 'translateX(100%)' :
    `translateX(${-currentOffset}px)`

  const handleTransitionEnd = () => {
    setIsAnimating(false)
    if (!committed || navigatedRef.current) return

    const targetUuid = committed === 'left' ? nextDoc?.fields?.uuid?.[0] : prevDoc?.fields?.uuid?.[0]
    const targetGroup = committed === 'left' ? nextDoc?.fields?.['group.id']?.[0] : prevDoc?.fields?.['group.id']?.[0]
    if (!targetUuid) {
      // Nothing to navigate to; reset
      setCommitted(null)
      setCurrentOffset(0)
      return
    }

    const params = new URLSearchParams(searchParams.toString())
    params.set('doc', targetUuid)
    params.set('group', stringToBase64Url(targetGroup))
    setHighlightedGroup(stringToBase64Url(targetGroup))
    navigatedRef.current = true
    
    // Scroll to top of the drawer content when navigating via swipe
    if (scrollRef?.current) {
      if (committed == 'left') {
        scrollRef.current.scrollTo({ top: 0, behavior: 'instant' })
      } else {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'instant' })
      }
    }
    
    router.replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div
      ref={hostRef}
      className="relative w-full h-full "
      style={{ touchAction: 'inherit' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0 pointer-events-none z-0" />
      {( swipeDirection || isAnimating || docLoading) && <div
        className="absolute inset-0 bg-white border-r-2 border-neutral-200 pointer-events-none z-0 p-2"
        style={{
          transform: `translateX(${leftIncomingX}%)`,
          transition: isAnimating ? 'transform 250ms ease-out' : 'none',
          willChange: 'transform'
        }}
      >
        <DocSkeleton/>
      </div>}

      { (swipeDirection || isAnimating || docLoading) && <div
        className="absolute inset-0 bg-white border-l-2 border-neutral-200 pointer-events-none z-0 p-2"
        style={{
          transform: `translateX(${rightIncomingX}%)`,
          transition: isAnimating ? 'transform 250ms ease-out' : 'none',
          willChange: 'transform'
        }}
      >
        <DocSkeleton/>
        </div>}

      <div
        className="relative z-0 pb-12 p-2"
        style={{
          transform: contentTranslate,
          transition: isAnimating ? 'transform 250ms ease-out' : 'none',
          willChange: 'transform'
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {children}
        
      </div>
    </div>
  )
}