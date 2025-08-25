'use client'
import { SearchContext } from "@/app/search-provider"
import { useCallback, useContext, useEffect, useRef, useState } from "react"
import { useSearchParams } from 'next/navigation';
import ResultItem from "./result-item";
import { getSkeletonLength } from "@/lib/utils";
import { useRouter } from "next/navigation";
import useCollapsedData from "@/state/hooks/collapsed-data";

const PER_PAGE = 30

export default function SearchResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const page = parseInt(searchParams.get('page') || '0')
  const { searchError } = useContext(SearchContext)
  
  // Track scroll direction for proactive loading states
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  
  // Use the new infinite query hook
  const {
    collapsedResults,
    collapsedTotal: totalHits,
    collapsedLoading,
    collapsedError,
    loadMore,
    canFetchNext,
    canFetchPrevious,
    isFetchingNext,
    isFetchingPrevious
  } = useCollapsedData()

  // References for intersection observers
  const topLoaderRef = useRef<HTMLDivElement>(null)
  const bottomLoaderRef = useRef<HTMLDivElement>(null)
  
  // Set up intersection observers for infinite scrolling
  useEffect(() => {
    // Observer for loading previous pages (when scrolling up)
    const topObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && canFetchPrevious && !isFetchingPrevious) {
          // Set scroll direction immediately for proactive UI feedback
          setScrollDirection('up')
          
          // Update URL to reflect current position
          const newPage = Math.max(0, page - 1)
          const newUrl = new URLSearchParams(searchParams)
          newUrl.set('page', newPage.toString())
          router.replace(`?${newUrl.toString()}`)
          
          // Load previous page data
          loadMore('previous')
        }
      },
      { threshold: 0.1 }
    )

    // Observer for loading next pages (when scrolling down)
    const bottomObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && canFetchNext && !isFetchingNext) {
          // Set scroll direction immediately for proactive UI feedback
          setScrollDirection('down')
          
          // Update URL to reflect current position
          const newPage = page + 1
          const newUrl = new URLSearchParams(searchParams)
          newUrl.set('page', newPage.toString())
          router.replace(`?${newUrl.toString()}`)
          
          // Load next page data
          loadMore('next')
        }
      },
      { threshold: 0.1 }
    )

    // Connect observers to their respective elements
    if (topLoaderRef.current) {
      topObserver.observe(topLoaderRef.current)
    }
    
    if (bottomLoaderRef.current) {
      bottomObserver.observe(bottomLoaderRef.current)
    }

    // Clean up observers when component unmounts
    return () => {
      topObserver.disconnect()
      bottomObserver.disconnect()
    }
  }, [canFetchNext, canFetchPrevious, isFetchingNext, isFetchingPrevious, loadMore, page, router, searchParams])

  // Reset scroll direction when fetching completes
  useEffect(() => {
    if (!isFetchingNext && !isFetchingPrevious) {
      setScrollDirection(null)
    }
  }, [isFetchingNext, isFetchingPrevious])

  // Determine if we need to show skeletons at top or bottom
  const showTopSkeletons = isFetchingPrevious || scrollDirection === 'up'
  const showBottomSkeletons = isFetchingNext || scrollDirection === 'down'

  return (
    <>
      {/* Top loader for upward scrolling - Show skeletons when fetching previous */}
      <div ref={topLoaderRef} className="h-10 mb-2">
        {showTopSkeletons && (
          <div className="flex flex-col gap-2">
            {Array.from({length: 2}).map((_, i) => (
              <div className="h-8 flex flex-col mx-2 flex-grow justify-center gap-1" key={`top-skeleton-${i}`}>
                <div className="bg-neutral-900/10 rounded-full h-3 animate-pulse" style={{width: `${getSkeletonLength(i, 4, 10)}rem`}}></div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <ul id="result_list" className='flex flex-col mb-2 divide-y divide-neutral-200'>
        {/* Render results - ensure each item has a unique key */}
        {collapsedResults.map((hit, index) => (
          <ResultItem 
            key={`${hit._id}-${index}`} 
            hit={hit} 
          />
        ))}
      </ul>
      
      {/* Always show bottom loader - with conditional skeletons */}
      <div ref={bottomLoaderRef} className="h-14 mt-2">
        {/* Show skeletons when loading next page */}
        {showBottomSkeletons && (
          <div className="flex flex-col gap-2">
            {Array.from({length: 20}).map((_, i) => (
              <li className="h-14 flex flex-col mx-2 flex-grow justify-center gap-1" key={`bottom-skeleton-${i}`}>
                <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 4, 10)}rem`}}></div>
                <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 10, 16)}rem`}}></div>
              </li>
            ))}
          </div>
        )}
      </div>
      
      {/* Initial loading state skeletons */}
      {collapsedLoading && !isFetchingNext && !isFetchingPrevious && !scrollDirection && (
        <div className="flex flex-col gap-2">
          {Array.from({length: 20}).map((_, i) => (
            <li className="h-14 flex flex-col mx-2 flex-grow justify-center gap-1" key={`loading-skeleton-${i}`}>
              <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 4, 10)}rem`}}></div>
              <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 10, 16)}rem`}}></div>
            </li>
          ))}
        </div>
      )}
      
      {/* Error and empty states */}
      {searchError || collapsedError ? (
        <div className="flex justify-center">
          <div role="status" aria-live="polite" className="text-primary-600 pb-4">
            <strong>{searchError?.status || collapsedError?.name}</strong> Det har oppstått ein feil
          </div>
        </div>
      ) : !collapsedLoading && !totalHits?.value && (
        <div className="flex justify-center">
          <div role="status" aria-live="polite" className="text-neutral-950 pb-4">
            Ingen søkeresultater
          </div>
        </div>
      )}
    </>
  )
}
