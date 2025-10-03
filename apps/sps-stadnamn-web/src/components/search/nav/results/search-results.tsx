'use client'
import { Fragment, useCallback, useEffect, useRef } from "react"
import ResultItem from "./result-item";
import { getSkeletonLength } from "@/lib/utils";
import useCollapsedData from "@/state/hooks/collapsed-data";
import useSearchData from "@/state/hooks/search-data";
import GroupInfo from "../../details/group/group-info";
//import { useGroup } from "@/lib/param-hooks";
import Clickable from "@/components/ui/clickable/clickable";
import { base64UrlToString, stringToBase64Url } from "@/lib/param-utils";
import { useSearchParams } from "next/navigation";
import { useGroup } from "@/lib/param-hooks";

export default function SearchResults() {
  const { searchError } = useSearchData()
  const resultsContainerRef = useRef<HTMLDivElement>(null)
  const { groupValue } = useGroup()
  const searchParams = useSearchParams()
  
  // Use the enhanced infinite query hook
  const {
    collapsedData,
    collapsedError,
    collapsedFetchNextPage,
    collapsedHasNextPage,
    isFetchingNextPage,
    collapsedStatus,
    collapsedInitialPage
  } = useCollapsedData()

  



  // Set up intersection observer for infinite scroll
  const observerTarget = useRef<HTMLDivElement | null>(null)

  // Load more when scrolling to the bottom
  const handleObserver = useCallback((entries: any) => {
    const [entry] = entries
    if (entry.isIntersecting && collapsedHasNextPage && !isFetchingNextPage) {
      collapsedFetchNextPage()
    }
  }, [collapsedFetchNextPage, collapsedHasNextPage, isFetchingNextPage])

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      rootMargin: '0px 0px 300px 0px' // Load more when 300px from bottom
    })
    
    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }
    
    return () => observer.disconnect()
  }, [handleObserver])

   // DEBUG: Check if component remounts
   const renderCount = useRef(0)
   const mountCount = useRef(0)
   
   useEffect(() => {
     mountCount.current += 1
     console.log('🔴 SearchResults MOUNTED (mount #' + mountCount.current + ')')
     return () => {
       console.log('🔴 SearchResults UNMOUNTED')
     }
   }, [])
   
   renderCount.current += 1
   console.log('🔵 SearchResults RENDER #' + renderCount.current + ', groupValue:', groupValue)
   



  // Render loading state
  if (collapsedStatus === 'pending' && collapsedInitialPage === 1) {
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
  const hasNoResults = collapsedStatus === 'success' && 
    (!collapsedData?.pages || collapsedData.pages.length === 0 || collapsedData.pages[0].data?.length === 0);

  return (
    <div ref={resultsContainerRef}>
      <ul id="result_list" className='flex flex-col mb-2 divide-y divide-neutral-200 border-t border-neutral-200'>
      {collapsedData?.pages.map((page, pageIndex) => (
    <Fragment key={`page-${pageIndex}`}>
    {page.data?.map((item: any) => {
      const expanded = groupValue == item.fields["group.id"]
      const itemKey = item.fields["group.id"]?.[0] || item._id || item.fields.uuid?.[0]
      return (
        <li key={itemKey}>
        <ResultItem 
          hit={item}
          aria-controls={`group-info-${item.fields["group.id"]}`}
          aria-expanded={expanded}
        />
        { expanded && <div id={`group-info-${item.fields["group.id"]}`}><GroupInfo/></div>}
      </li>
      )})}
    </Fragment>
))}
        
        {/* Loading more indicator — attach observer to the skeleton block */}
        {collapsedHasNextPage && (
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
            <strong>{searchError?.name || collapsedError?.name}</strong> Det har oppstått ein feil
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
