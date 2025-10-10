'use client'
import { Fragment, useEffect, useRef } from "react"
import ResultItem from "./result-item";
import { getSkeletonLength } from "@/lib/utils";
import useCollapsedData from "@/state/hooks/collapsed-data";
import useSearchData from "@/state/hooks/search-data";
import GroupInfo from "../../details/group/group-info";
import Clickable from "@/components/ui/clickable/clickable";
import { base64UrlToString, stringToBase64Url } from "@/lib/param-utils";
import { useSearchParams } from "next/navigation";
import { useGroup } from "@/lib/param-hooks";
import { PiPlusBold } from "react-icons/pi";
import useGroupData from "@/state/hooks/group-data";

export default function SearchResults() {
  const { searchError } = useSearchData()
  const resultsContainerRef = useRef<HTMLDivElement>(null)
  const { groupValue } = useGroup()
  const searchParams = useSearchParams()
  const init = searchParams.get('init')
  const initValue = init ? base64UrlToString(init) : null
  const { groupData: initGroupData, groupLoading: initGroupLoading } = useGroupData(init)
  
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



  // Check if there are no results
  const hasNoResults = collapsedStatus === 'success' && 
    (!collapsedData?.pages || collapsedData.pages.length === 0 || collapsedData.pages[0].data?.length === 0);

  return (
    <div ref={resultsContainerRef}>
      <ul id="result_list" className='flex flex-col mb-2 divide-y divide-neutral-200 border-t border-neutral-200'>
      {init && (initGroupLoading ? (
        <div className="h-14 flex flex-col mx-2 flex-grow justify-center gap-1 divide-y divide-neutral-200">
          <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{width: `10rem`}}></div>
          <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{width: `16rem`}}></div>
        </div>
      ) : initGroupData && (
        <li key={`init-${initValue}`}>
          <ResultItem 
            hit={initGroupData}
          />
          <div id={`group-info-${initGroupData.fields["group.id"]}`}><GroupInfo overrideGroupCode={init || undefined}/></div>
        </li>
      ))}

      {collapsedStatus === 'pending' && collapsedInitialPage === 1 ? Array.from({ length: 30 }).map((_, i) => (
          <div key={`skeleton-${i}`} className="h-14 flex flex-col mx-2 flex-grow justify-center gap-1 divide-y divide-neutral-200">
            <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 4, 10)}rem`}}></div>
            <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 10, 16)}rem`}}></div>
          </div>
        )) :       
      collapsedData?.pages.map((page, pageIndex) => (
    <Fragment key={`page-${pageIndex}`}>
    {page.data?.map((item: any) => {
      if (initValue && item.fields["group.id"]?.[0] == initValue) return null;
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
      </ul>
      
      {/* Vis meir button */}
      {collapsedHasNextPage && (
        <div className="flex justify-center my-4">
          <span
            onClick={() => !isFetchingNextPage && collapsedFetchNextPage()}
            role="button"
            tabIndex={0}
            className={`
              text-primary-800 cursor-pointer select-none
              px-4 py-2 rounded
              transition-colors
              ${isFetchingNextPage ? 'opacity-60 pointer-events-none' : 'hover:bg-primary-100'}
            `}
          >
            {isFetchingNextPage ? 'Lastar...' : 'Vis fleire'}
          </span>
        </div>
      )}
      {/* Error and empty states */}
      {searchError || collapsedError ? (
        <div className="flex justify-center">
          <div role="status" aria-live="polite" className="text-primary-700 pb-4">
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
