'use client'
import { Fragment, useEffect, useRef, useState } from "react"
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
import Spinner from "@/components/svg/Spinner";


const CollapsibleResultItem = ({hit, activeGroupValue}: {hit: any, activeGroupValue: string | null}) => {
  const [expanded, setExpanded] = useState(activeGroupValue == hit.fields["group.id"][0])
  const groupCode = stringToBase64Url(hit.fields["group.id"][0])
  return (
    <li className="relative" key={hit.fields["group.id"][0]}>
      <ResultItem hit={hit} onClick={() => setExpanded(!expanded)} aria-controls={`group-info-${hit.fields["group.id"][0]}`} aria-expanded={expanded}/>
      {expanded && <div id={`group-info-${hit.fields["group.id"][0]}`} className="pb-4"><GroupInfo overrideGroupCode={groupCode}/>
      
      </div>}
    </li>
  )
}

export default function SearchResults() {
  const { searchError } = useSearchData()
  const resultsContainerRef = useRef<HTMLDivElement>(null)
  const { activeGroupValue } = useGroup()
  const searchParams = useSearchParams()
  const init = searchParams.get('init')
  const initValue = init ? base64UrlToString(init) : null
  const { groupData: initGroupData, groupLoading: initGroupLoading } = useGroupData(init)
  
  // Use the enhanced infinite query hook
  const {
    collapsedData,
    collapsedError,
    collapsedLoading,
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
      {init && (initGroupLoading ? (
        <div className="h-14 flex flex-col mx-2 flex-grow justify-center gap-1 divide-y divide-neutral-200">
          <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{width: `10rem`}}></div>
          <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{width: `16rem`}}></div>
        </div>
      ) : initGroupData && (
        <li key={`init-${initValue}`}>
          <ResultItem 
            notClickable={true}
            hit={initGroupData}
          />
          <div id={`group-info-${initGroupData.fields["group.id"]}`}><GroupInfo overrideGroupCode={init || undefined}/></div>
        </li>
      ))}

      <ul id="result_list" className='flex flex-col mb-12 xl:mb-2 divide-y divide-neutral-200 border-y border-neutral-200'>
      

      {(initGroupLoading || collapsedLoading && collapsedInitialPage === 1) ? Array.from({ length: 30 }).map((_, i) => (
          <div key={`skeleton-${i}`} className="h-14 flex flex-col mx-2 flex-grow justify-center gap-1 divide-y divide-neutral-200">
            <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 4, 10)}rem`}}></div>
            <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 10, 16)}rem`}}></div>
          </div>
        )) :       
      collapsedData?.pages.map((page, pageIndex) => (
    <Fragment key={`page-${pageIndex}`}>
    {page.data?.map((item: any) => {
      if (initValue && item.fields["group.id"]?.[0] == initValue) return null;
      return (

        <CollapsibleResultItem 
          key={item.fields["group.id"]?.[0]}
          hit={item}
          activeGroupValue={activeGroupValue}
        />

      )})}
    </Fragment>
))}
      </ul>
      
      {/* Vis meir button */}
      {collapsedHasNextPage && (
        <div className="flex justify-center my-4">
          <button
            type="button"
            onClick={() => !isFetchingNextPage && collapsedFetchNextPage()}
            className={`
              text-neutral-950 cursor-pointer select-none
              flex items-center gap-2
              btn-outline btn
              justify-center

              px-4 py-2 rounded-full xl:rounded-md
              w-full mx-3
              transition-colors
              ${isFetchingNextPage ? 'opacity-60 pointer-events-none' : ''}
            `}
          >
            {isFetchingNextPage ? <Spinner status="Lastar" /> : <PiPlusBold aria-hidden="true" />} {isFetchingNextPage ? 'Lastar...' : 'Vis fleire'}
          </button>
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
