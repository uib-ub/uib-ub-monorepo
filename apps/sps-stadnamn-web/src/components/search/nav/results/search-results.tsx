'use client'
import { Fragment, useContext, useEffect, useRef, useState } from "react"
import ResultItem from "./result-item";
import { getSkeletonLength } from "@/lib/utils";
import useCollapsedData from "@/state/hooks/collapsed-data";
import useSearchData from "@/state/hooks/search-data";
import GroupInfo from "../../details/group/group-info";
import Clickable from "@/components/ui/clickable/clickable";
import { base64UrlToString, stringToBase64Url } from "@/lib/param-utils";
import { useSearchParams } from "next/navigation";
import { useGroup } from "@/lib/param-hooks";
import { PiMapPinArea, PiMapPinAreaBold, PiMapPinFill, PiMapPinSimpleBold, PiPlusBold, PiXBold } from "react-icons/pi";
import useGroupData from "@/state/hooks/group-data";
import Spinner from "@/components/svg/Spinner";
import { useSessionStore } from "@/state/zustand/session-store";
import { GlobalContext } from "@/state/providers/global-provider";
import { useRouter } from "next/navigation";



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
  const snappedPosition = useSessionStore((s) => s.snappedPosition)
  const { isMobile } = useContext(GlobalContext)
  const point = searchParams.get('point') ? (searchParams.get('point')!.split(',').map(parseFloat) as [number, number]) : null
  const displayRadius = useSessionStore((s) => s.displayRadius)
  const setDisplayRadius = useSessionStore((s) => s.setDisplayRadius)
  const submittedRadius = searchParams.get('radius')
  const router = useRouter()
  
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
  const hasNoResults = collapsedStatus === 'success' && (!collapsedData?.pages || collapsedData.pages.length === 0 || collapsedData.pages[0].data?.length === 0);


  if (isMobile && activeGroupValue && snappedPosition == 'bottom') {
    return <div className="px-2">
      Hello
      TODO: fix scroll issue when container becomes scrollable
    </div>
  }



  return (
    <div ref={resultsContainerRef} className="mb-28 xl:mb-0">
      {
        point && (
          <div className="p-2 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              Vald punkt: {point.map(coord => coord.toFixed(5)).join(', ')}<Clickable remove={['point', 'radius']}><PiXBold/></Clickable>
            </div>
            {/*TODO: move radius input to filters. Distance from both point and selected group */}
            <div className="flex items-center gap-2">
              <div id="radius-label">
                <span>{submittedRadius ? 'Radius: ' : 'Avgrens søket:'}</span>
                {submittedRadius && <span>
                  {(() => {
                    const radiusValueRaw = displayRadius || submittedRadius || 1000;
                    const radiusValue = Number(radiusValueRaw);
                    if (radiusValue >= 1000) {
                      return `${(radiusValue / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} km`;
                    } else {
                      return `${radiusValue} m`;
                    }
                  })()}
                </span>}
              </div>
              {submittedRadius ? (
                <Clickable remove={['radius']}><PiXBold/></Clickable>
              ) : (
                <div className="flex items-center gap-2 px-2">
                  <input
                    name="radius"
                    type="range"
                    min="1000"
                    max="100000"
                    step="100"
                    defaultValue={displayRadius || submittedRadius || 1000}
                    onChange={e => setDisplayRadius(e.target.value ? parseInt(e.target.value) : null)}
                    className="accent-primary-700 w-32"
                    aria-labelledby="radius-label"
                    onPointerUp={e => {
                      const value = (e.target as HTMLInputElement).value;
                      const params = new URLSearchParams(searchParams);
                      setDisplayRadius(null);
                      if (value) {
                        params.set("radius", value)
                      } else {
                        params.delete("radius");
                      }
                      router.push('?' + params.toString());
                    }}
                  />
                  <span>
                    {(() => {
                      const radiusValueRaw = displayRadius || submittedRadius || 1000;
                      const radiusValue = Number(radiusValueRaw);
                      if (radiusValue >= 1000) {
                        return `${(radiusValue / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 })} km`;
                      } else {
                        return `${radiusValue} m`;
                      }
                    })()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )
        

      }
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

      <ul id="result_list" className='flex flex-col mb-8 xl:mb-2 divide-y divide-neutral-200 border-y border-neutral-200'>
      

      {(initGroupLoading || collapsedLoading && collapsedInitialPage === 1) ? Array.from({ length: 30 }).map((_, i) => (
          <div key={`skeleton-${i}`} className="h-14 flex flex-col mx-2 flex-grow justify-center gap-1 divide-y divide-neutral-200">
            <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 4, 10)}rem`}}></div>
            <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 10, 16)}rem`}}></div>
          </div>
        )) :       
      collapsedData?.pages.map((page: any, pageIndex: number) => (
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
              text-xl

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
           Det har oppstått ein feil
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
