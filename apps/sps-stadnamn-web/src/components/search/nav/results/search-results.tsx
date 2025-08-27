'use client'
import { SearchContext } from "@/app/search-provider"
import { Fragment, useCallback, useContext, useEffect, useRef } from "react"
import { useSearchParams } from 'next/navigation';
import ResultItem from "./result-item";
import { getSkeletonLength } from "@/lib/utils";
import useCollapsedData from "@/state/hooks/collapsed-data";
import { useRouter } from "next/navigation";
import { useMode } from "@/lib/search-params";

export default function SearchResults() {
  const { searchError } = useContext(SearchContext)
  const resultsContainerRef = useRef<HTMLDivElement>(null)
  
  // Use the enhanced infinite query hook
  const {
    collapsedData,
    collapsedError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    initialPage,
    isLoading,
  } = useCollapsedData()



  // Set up intersection observer for infinite scroll
  const observerTarget = useRef<HTMLDivElement | null>(null)

  // Load more when scrolling to the bottom
  const handleObserver = useCallback((entries: any) => {
    const [entry] = entries
    if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: '0px 0px 300px 0px' // Load more when 300px from bottom
    })
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }
    
    return () => observer.disconnect()
  }, [handleObserver])

  // Render loading state
  if (status === 'pending' && initialPage === 1) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={`skeleton-${i}`} className="h-14 flex flex-col mx-2 flex-grow justify-center gap-1 divide-y divide-neutral-200">
            <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 4, 10)}rem`}}></div>
            <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 10, 16)}rem`}}></div>
          </div>
        ))}
      </div>
    )
  }

  // Check if there are no results
  const hasNoResults = status === 'success' && 
    (!collapsedData?.pages || collapsedData.pages.length === 0 || collapsedData.pages[0].data?.length === 0);

  return (
    <div ref={resultsContainerRef}>
      <ul id="result_list" className='flex flex-col mb-2'>
        {collapsedData?.pages.map((page, pageIndex) => (
            <Fragment key={`page-${pageIndex}`}>
            {page.data?.map((item: any, itemIndex: number) => (
              <ResultItem 
              key={`item-${pageIndex}-${itemIndex}`} 
              hit={item}
              />
            ))}
            </Fragment>
        ))}
        
        {/* Loading more indicator — attach observer to the skeleton block */}
        {hasNextPage && (
          <div ref={observerTarget} className="py-4 divide-y divide-neutral-200">
            {Array.from({ length:4 }).map((_, i) => (
              <div key={`loading-more-${i}`} className="h-14 flex flex-col mx-2 flex-grow justify-center gap-1">
                <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 4, 10)}rem`}}></div>
                <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 10, 16)}rem`}}></div>
              </div>
            ))}
          </div>
        )}
        
        {/* observer target removed — skeleton blocks act as the observer */}
      </ul>
      
      {/* Error and empty states */}
      {searchError || collapsedError ? (
        <div className="flex justify-center">
          <div role="status" aria-live="polite" className="text-primary-600 pb-4">
            <strong>{searchError?.status || collapsedError?.name}</strong> Det har oppstått ein feil
          </div>
        </div>
      ) : hasNoResults && (
        <div className="flex justify-center">
          <div role="status" aria-live="polite" className="text-neutral-950 pb-4">
            Ingen søkeresultater
          </div>
        </div>
      )}
    </div>
  )
}
