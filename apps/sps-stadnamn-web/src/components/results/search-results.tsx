'use client'
import Spinner from "@/components/svg/Spinner";
import Clickable from "@/components/ui/clickable/clickable";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import {
  useGroupParam,
  useInitParam,
  useNoGeoOn,
  usePoint,
  useQParam,
  useResultLimitNumber,
  useSourceViewOn,
} from "@/lib/param-hooks";
import { base64UrlToString } from "@/lib/param-utils";
import { useSearchQuery } from "@/lib/search-params";
import useResultCardData from "@/state/hooks/result-card-data";
import useSearchData from "@/state/hooks/search-data";
import { GlobalContext } from "@/state/providers/global-provider";
import { useSessionStore } from "@/state/zustand/session-store";
import Link from "next/link";
import { Fragment, useContext, useEffect, useMemo, useRef } from "react";
import { PiMagnifyingGlass, PiQuestion, PiX, PiXBold } from "react-icons/pi";
import ResultCard from "@/components/results/card/result-card";
import ActiveFilters from "@/components/results/active-filters";
import ResultItem from "./result-item";
import SearchQueryDisplay from "./search-query-display";
import IconButton from "@/components/ui/icon-button";
import useListData from "@/state/hooks/list-data";
import { ResultCardSkeleton, ResultItemSkeleton } from "@/components/results/result-skeletons";

import { useSearchParams, useRouter } from "next/navigation";
import { BATCH_SIZE, FIRST_VISIBLE_RESULTS, STARTING_BATCH_SIZE } from "@/lib/result-limits";
import ResultsHeader from "./results-header";
import InfoMessage from "../ui/notifications/info-message";

export default function SearchResults() {
  const { searchError, groupTotalHits, docTotalHits, noGeoGroupCount } = useSearchData()
  const resultsContainerRef = useRef<HTMLDivElement>(null)
  const init = useInitParam()
  const group = useGroupParam()
  const qParam = useQParam()
  const sourceViewOn = useSourceViewOn()
  const { resultCardData: initResultCardData, resultCardLoading: initResultCardLoading } = useResultCardData()
  const initValue = init ? base64UrlToString(init) : null
  // In grouped view, init points to a group id (base64 encoded).
  // In non-grouped view, init points to a source uuid, so we must derive the
  // corresponding group id from grouped init data to exclude it from collapsed results.
  const initGroupId = init
    ? (initResultCardData?.id ?? (!sourceViewOn ? initValue : null))
    : (!sourceViewOn ? initValue : null)
  const initHasCoordinates = initResultCardData?.fields?.location?.coordinates?.length >= 2
  const snappedPosition = useSessionStore((s) => s.snappedPosition)
  const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition)
  const { isMobile, mapFunctionRef } = useContext(GlobalContext)
  const point = usePoint()
  const { facetFilters, datasetFilters } = useSearchQuery()
  const filterCount = facetFilters.length + datasetFilters.length
  const noGeoOn = useNoGeoOn()
  const resultLimitNumber = useResultLimitNumber()
  const resultCount = sourceViewOn ? docTotalHits?.value ?? 0 : groupTotalHits?.value ?? 0
  const resultCountExceptInit = resultCount - (init ? 1 : 0)


  const {
    listData,
    listLoadedCount,
    listError,
    listLoading,
    listFetchNextPage,
    listHasNextPage,
    listIsFetchingNextPage,
    listStatus,
    mobilePreview,
  } = useListData()





  // Empty-state helpers (kept intentionally simple to leverage existing total results numbers).
  const hasNoResults =
    listStatus === 'success' &&
    (!listData?.pages ||
      listData.pages.length === 0 ||
      listData.pages[0].data?.length === 0)

  // When `init` is present we render it separately, so "additional" means anything beyond the init item.
  const hasNoAdditionalResults =
    listStatus === 'success' && !!init && resultCountExceptInit <= 0

  // Whether to show the "Utan koordinatar" filter control in the options row.
  // Purpose: 
  const firstHasLocation = listData?.pages[0]?.data?.[0]?.fields?.location?.[0]?.coordinates?.length === 2
  const showNoLocationToggle =
    (!!init || !point) && // results without coordinates are irrelevant if you have a start point but no init
    !!noGeoGroupCount &&
    noGeoGroupCount > 0 &&
    (noGeoOn || firstHasLocation);

  return (
    <div ref={resultsContainerRef} className="mb-28 xl:mb-0">
      {
        (point && !init) && (
          <div className={`flex px-3 flex-col gap-2 relative ${isMobile ? 'text-sm py-3 ' : 'text-base px-3 pb-4'}`}>
            <div className="flex items-center gap-1">
              <ClickableIcon label="Flytt startpunktet" className="flex items-center" onClick={() => point && mapFunctionRef.current?.flyTo([point[0], point[1]], 15, { duration: 0.25 })}>
                <img src="/currentLocation.svg" alt="" aria-hidden="true" className="w-6 h-6 mb-1 self-center" />
              </ClickableIcon>

                     {`${Math.abs(point[0]).toFixed(6)}°${point[0] >= 0 ? 'N' : 'S'}, ${Math.abs(point[1]).toFixed(6)}°${point[1] >= 0 ? 'Ø' : 'V'}`}

              
              <InfoMessage message={isMobile ? "Trykk og hald i kartet for å flytte startpunktet" : "Høgreklikk i kartet for å flytte startpunktet"} messageId="start-point-tip" />
              <div className={`absolute right-3 ${isMobile ? 'top-3' : 'top-0'}`}>
                <ClickableIcon className="p-1 btn btn-outline rounded-full text-neutral-900" label="Fjern startpunkt" remove={['point', 'radius']} onClick={() => {
                  if (snappedPosition == 'top') setSnappedPosition("bottom");
                }}>
                  <PiXBold aria-hidden="true" className="text-base" />
                </ClickableIcon>
              </div>


            </div>


          </div>
        )
      }
      {init && !group && (initResultCardLoading ? (
        <div className="relative">
          <ResultCardSkeleton hasIiif={initResultCardData?.iiifItems?.length > 0} />
        </div>
      ) : initResultCardData && (
        <div className="relative" key={`init-${initValue}`}>
          <ResultCard itemId={init} hasIiif={initResultCardData?.iiifItems?.length > 0} mobilePreview={mobilePreview} />
        </div>
      ))}


      {(init || qParam || isMobile) ? (initResultCardLoading ? (
        <div className="w-full border-t border-neutral-200 py-2 px-3 flex items-center gap-2">
          <div className="w-4 h-4 bg-neutral-900/10 rounded-full animate-pulse"></div>
          <div className="h-4 bg-neutral-900/10 rounded-full animate-pulse" style={{ width: '10rem' }}></div>
        </div>
      ) : (
        <div className="w-full border-t border-neutral-200 flex flex-wrap items-center bg-neutral-50 border-b-none py-2 px-3 gap-3 text-neutral-950 min-w-0 overflow-hidden">
          {
            isMobile && <div className="w-full flex"> <ResultsHeader /></div>
          }
          {qParam ? (
            <Clickable
              remove={['q', 'searchSort']}
              add={{ q: null  }}
              className="h-9 px-3 rounded-md bg-white border border-neutral-200 flex items-center gap-2 cursor-pointer max-w-full min-w-0"
            >
              <PiMagnifyingGlass className="" aria-hidden="true" />
              <span className="truncate flex-1 min-w-0 max-w-full block">
                {qParam}
              </span>
              <PiX className="text-lg" aria-hidden="true" />
            </Clickable>
          ) : null}

          {/* Toolbar items share the same flex row as the chip so they wrap together. */}
          {qParam && <SearchQueryDisplay
            showNoLocationToggle={showNoLocationToggle}
            noGeoGroupCount={noGeoGroupCount ?? 0}
          />}
        </div>
      )) : null}

      {!mobilePreview && (
        <>
          <ul id="result_list" aria-label= {sourceViewOn ? 'Fleire kjeldeoppslag' : 'Fleire namnegrupper'} className={`flex flex-col divide-y divide-neutral-200 border-y border-neutral-200`}>
            {Array.from({
              length: resultLimitNumber ||
                Math.min(
                  resultCountExceptInit,
                  (init ? FIRST_VISIBLE_RESULTS : STARTING_BATCH_SIZE) + 1
                )
            }).map((_, i) => {


              let body = null
              const hasMoreResults = listLoadedCount && listLoadedCount < resultCount
              const nextButtonSlotIndex = resultLimitNumber ? resultLimitNumber - 1 : (init ? FIRST_VISIBLE_RESULTS : STARTING_BATCH_SIZE)

              //if (i > nextButtonSlotIndex) {
              //  return <div key={`result-${i}`} className="relative">TOMT</div>
              //}

              const isNextButton = i == nextButtonSlotIndex && hasMoreResults

              // `useListData` loads page 0 with `STARTING_BATCH_SIZE`, and subsequent pages with `BATCH_SIZE`.
              const calculatedPageIndex =
                i < STARTING_BATCH_SIZE
                  ? 0
                  : 1 + Math.floor((i - STARTING_BATCH_SIZE) / BATCH_SIZE)
              const page = listData?.pages[calculatedPageIndex]
              const pageStartIndex =
                calculatedPageIndex === 0
                  ? 0
                  : STARTING_BATCH_SIZE + (calculatedPageIndex - 1) * BATCH_SIZE
              const localIndex = i - pageStartIndex
              const itemData = page?.data?.[localIndex]
              const hasIiif = !!itemData?.fields?.iiif?.[0]


              if (isNextButton) {
                body = (

                  <Clickable
                    type="button"
                    add={{
                      resultLimit: (resultLimitNumber ?? STARTING_BATCH_SIZE) + BATCH_SIZE
                    }}
                    onClick={() => {
                      listFetchNextPage()
                    }}
                    className={`
              flex items-center gap-2
              text-neutral-900
              bg-neutral-50
              font-semibold
              text-xl
              p-3
              justify-center w-full
               
              transition-colors
              ${listIsFetchingNextPage ? 'opacity-60 pointer-events-none' : ''}
            `}>
                    Vis meir
                  </Clickable>

                );
              }
              else if (itemData) {
                if (isMobile || !init || group) {
                  body = (
                    <ResultCard
                      itemId={itemData.fields.uuid[0]}
                      hasIiif={hasIiif}
                      distanceMeters={itemData.distance}
                    />
                  );
                } else {
                  body = (
                    <ResultItem
                      hit={itemData}
                    />
                  );
                }
              }
              else if (listIsFetchingNextPage || listLoading) {
                body = <>{(isMobile || !init || group)
                  ? <ResultCardSkeleton hasIiif={hasIiif} />
                  : <ResultItemSkeleton />
                }</>
              }
              else {
                return null
                //body = <div key={`result-${i}`} className="relative">TOMT</div>
              }

              return (
                <li key={`result-${i}-${itemData?.fields?.uuid?.[0]}`} className="relative">
                  {body}
                </li>
              )
            })}

          </ul>
          {(isMobile ||
            searchError ||
            listError ||
            hasNoResults ||
            hasNoAdditionalResults) && (
              <div className={`flex flex-col gap-4 py-4 pb-8 xl:pb-4`}>
                {filterCount > 0 && (
                  <div className="mx-2 mb-4">
                    <ActiveFilters />
                  </div>
                )}

                {/* Error and empty states */}
                {searchError || listError ? (
                  <div className="flex justify-center">
                    <div role="status" aria-live="polite" className="text-primary-700 pb-4">
                      Det har oppstått ein feil
                    </div>
                  </div>
                ) : hasNoResults ? (
                  <div className="flex justify-center">
                    <div
                      role="status"
                      aria-live="polite"
                      className="flex flex-col items-center gap-2 text-neutral-950 pb-4"
                    >
                      Ingen søkeresultat
                      <Link
                        scroll={false}
                        href="/help"
                        className="flex items-center gap-2 px-4 py-3 rounded-md transition-colors no-underline text-neutral-900 hover:bg-accent-100"
                      >
                        <PiQuestion className="text-xl" aria-hidden="true" />
                        Søketips
                      </Link>
                    </div>
                  </div>
                ) : hasNoAdditionalResults ? (
                  <div className="flex justify-center">
                    <div
                      role="status"
                      aria-live="polite"
                      className="flex flex-col items-center gap-2 text-neutral-950 pb-4"
                    >
                      <span>Ingen fleire treff</span>
                      <Link
                        scroll={false}
                        href="/help"
                        className="flex items-center gap-2 px-4 py-3 rounded-md transition-colors no-underline text-neutral-900 hover:bg-accent-100"
                      >
                        <PiQuestion className="text-xl" aria-hidden="true" />
                        Søketips
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
        </>
      )}
    </div>
  )
}
