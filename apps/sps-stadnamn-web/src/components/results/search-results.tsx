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
  useResultLimit,
  useResultLimitParam,
  useResultLimitUiConfig,
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
import { ResultCardSkeleton, ResultItemSkeleton } from "@/components/results/card/card-skeletons";

export default function SearchResults() {
  const { searchError, groupTotalHits, noGeoGroupCount } = useSearchData()
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
  const resultLimit = useResultLimit()
  const explicitResultLimitParam = useResultLimitParam()
  const isExplicitResultLimit = explicitResultLimitParam !== null
  const {
    maxResultLimit: MAX_RESULT_LIMIT,
    resultLimitIncrement,
    defaultResultLimit,
    defaultCollapsedResultLimit,
  } = useResultLimitUiConfig()
  const numericResultLimit = Number.isFinite(resultLimit) ? resultLimit : 0
  const cappedResultLimit = Math.max(0, Math.min(numericResultLimit, MAX_RESULT_LIMIT))



  const {
    listData,
    listError,
    listLoading,
    listFetchNextPage,
    listHasNextPage,
    listIsFetchingNextPage,
    listStatus,
    listInitialPage,
    mobilePreview,
  } = useListData()

  // Helper: count additional results.
  // In grouped mode we can rely on cardinality: total groups minus the init group.
  const additionalResultsCount = useMemo(() => {
    if (!listData) return 0

    // In source-view (document mode), fall back to counting documents excluding the init uuid.
    if (sourceViewOn) {
      const allHits = listData.pages.flatMap((page: any) => page.data || [])
      return allHits.length
    }

    // In grouped mode, use the unique group cardinality when available.
    const totalGroups = groupTotalHits?.value ?? 0
    if (initGroupId) {
      // We only care about whether there are groups beyond the init group,
      // so effectively checking if total - 1 is greater than zero.
      return Math.max(totalGroups - 1, 0)
    }

    return totalGroups
  }, [listData, groupTotalHits, initGroupId])

  // Check if there are no results
  const hasNoResults = listStatus === 'success' && (!listData?.pages || listData.pages.length === 0 || listData.pages[0].data?.length === 0);
  const hasNoAdditionalResults =
    listStatus === 'success' &&
    !!init &&
    additionalResultsCount === 0

  // Maximum number of list items to render.
  // Defaults are handled inside `useResultLimit()`.
  const maxVisibleResults = Number.isFinite(cappedResultLimit) ? cappedResultLimit : 0;

  // Cap the visible results further based on total hit count.
  //
  // - When `init` is present: default is `5`, but if there are more than 5
  //   additional results we only render `3` initially.
  // - When `init` is NOT present: default is `10`, but if there are more than 10
  //   results we only render `5` initially.
  //
  // This avoids a pointless "Vis meir" interaction when there are only
  // a few extra items.
  const totalResultsCountForCap = useMemo(() => {
    // In source view we currently only have a reliable count for the loaded hits,
    // so we fall back to the already-derived value.
    if (sourceViewOn) return additionalResultsCount
    const totalGroups = groupTotalHits?.value ?? 0
    return initGroupId ? Math.max(totalGroups - 1, 0) : totalGroups
  }, [sourceViewOn, additionalResultsCount, groupTotalHits, initGroupId])

  const effectiveMaxVisibleResults = useMemo(() => {
    if (
      maxVisibleResults === defaultResultLimit &&
      !isExplicitResultLimit &&
      totalResultsCountForCap > defaultResultLimit
    ) {
      return defaultCollapsedResultLimit
    }

    return maxVisibleResults
  }, [maxVisibleResults, totalResultsCountForCap, defaultResultLimit, defaultCollapsedResultLimit, isExplicitResultLimit])

  // Total number of results that have been loaded from the API so far.
  const totalLoadedResults = useMemo(() => {
    if (!listData) return 0;
    return (listData.pages as any[]).reduce((acc, page: any) => {
      return acc + (page.data?.length ?? 0);
    }, 0);
  }, [listData]);



  // If `resultLimit` was explicitly provided in the URL, auto-load pages until
  // we have enough results to satisfy that limit (no need to click "Vis meir").
  useEffect(() => {
    if (!isExplicitResultLimit) return
    if (!Number.isFinite(resultLimit) || resultLimit <= 0) return
    if (mobilePreview) return
    if (listStatus !== "success") return
    if (totalLoadedResults >= effectiveMaxVisibleResults) return
    if (!listHasNextPage) return
    if (listIsFetchingNextPage) return

    listFetchNextPage()
  }, [
    isExplicitResultLimit,
    resultLimit,
    mobilePreview,
    listStatus,
    totalLoadedResults,
    effectiveMaxVisibleResults,
    listHasNextPage,
    listIsFetchingNextPage,
    listFetchNextPage,
  ])

  const shouldShowCappedAtMaxTableViewCta =
    maxVisibleResults === MAX_RESULT_LIMIT &&
    totalResultsCountForCap > MAX_RESULT_LIMIT &&
    totalLoadedResults >= MAX_RESULT_LIMIT

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
          <div className="p-3 flex flex-col gap-2 relative">
            <div className="flex items-center gap-2">
              <IconButton label="Zoom til startpunktet" className="flex items-center justify-center" onClick={() => point && mapFunctionRef.current?.flyTo([point[0], point[1]], 15, { duration: 0.25 })}><img src="/currentLocation.svg" alt="" aria-hidden="true" className="w-8 h-8 mb-1 self-center" /></IconButton>
               <div className="flex flex-col">
                <span className="flex-1">
                  {point ? (
                    <>
                      {`${Math.abs(point[0]).toFixed(6)}°${point[0] >= 0 ? 'N' : 'S'}, ${Math.abs(point[1]).toFixed(6)}°${point[1] >= 0 ? 'Ø' : 'V'}`}
                    </>
                  ) : 'Ukjent'}
                </span>
                <span className="text-neutral-800 text-sm">{isMobile ? "Trykk og hald i kartet for å flytte startpunktet" : "Høgreklikk i kartet for å flytte startpunktet"}</span>
                </div>
              <div className="absolute right-3 top-3">
                <ClickableIcon className="p-1 btn btn-outline rounded-full text-neutral-900" label="Fjern startpunkt" remove={['point', 'radius']} onClick={() => {
                  if (snappedPosition == 'top') setSnappedPosition("bottom");
                }}>
                  <PiXBold aria-hidden="true" className="text-xl" />
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


      {(init || qParam)? (initResultCardLoading ? (
        <div className="w-full border-t border-neutral-200 py-2 px-3 flex items-center gap-2">
          <div className="w-4 h-4 bg-neutral-900/10 rounded-full animate-pulse"></div>
          <div className="h-4 bg-neutral-900/10 rounded-full animate-pulse" style={{ width: '10rem' }}></div>
        </div>
      ) : (
        <div className="w-full border-t border-neutral-200 flex flex-wrap items-center bg-neutral-50 border-b-none pt-4 pb-2 xl:py-2 px-3 gap-3 text-neutral-950 min-w-0 overflow-hidden">
          {qParam ? (
            <Clickable
              remove={['q', 'searchSort']}
              add={{ q: null }}
              className="h-9 px-3 rounded-md bg-white border border-neutral-200 flex items-center gap-2 cursor-pointer max-w-full min-w-0"
            >
              <PiMagnifyingGlass className="" aria-hidden="true" />
              <span className="truncate flex-1 min-w-0 max-w-full block">
                {qParam}
              </span>
              <PiX className="text-lg" aria-hidden="true" />
            </Clickable>
          ) : (
            <>
              <span
                id="other-groups-title"
                className={`text-lg font-sans text-neutral-900 whitespace-nowrap`}
              >
                {sourceViewOn ? 'Fleire kjeldeoppslag' : 'Fleire namnegrupper'}
              </span>

            </>
          )}

          {/* Toolbar items share the same flex row as the chip so they wrap together. */}
          {qParam && <SearchQueryDisplay
            showNoLocationToggle={showNoLocationToggle}
            noGeoGroupCount={noGeoGroupCount ?? 0}
          />}
        </div>
      )) : null}

      {!mobilePreview && (
        <>
          {!hasNoAdditionalResults && (
            <ul id="result_list" aria-labelledby="other-groups-title" className={`flex flex-col divide-y divide-neutral-200 border-y border-neutral-200`}>


            {(listLoading && listInitialPage === 1) ? Array.from({ length: listInitialPage === 1 ? 3 : 20  }).map((_, i) => (
              <li key={`skeleton-${i}`} className="relative">
                {(isMobile || !init || group)
                  ? <ResultCardSkeleton />
                  : <ResultItemSkeleton />
                }
              </li>
            )) :
              (() => {
                let renderedCount = 0
                return listData?.pages.map((page: any, pageIndex: number) => {
                const isLastPage = pageIndex === (listData?.pages.length || 0) - 1




                return (
                  <Fragment key={`page-${pageIndex}`}>
                    {page.data?.map((item: any, idx: number) => {
                      if (renderedCount >= effectiveMaxVisibleResults) return null
                      if (!sourceViewOn && !item.fields["group.id"]) {
                        console.log("No group ID", item);
                        return null
                      }
                      renderedCount += 1
                      const groupId = item.fields['group.id']?.[0]
                      const uuid = item.fields['uuid']?.[0]
                      const itemId = sourceViewOn ? uuid : groupId
                      const domId = uuid || groupId
                      const hasIiif = !!item.fields['iiif']?.[0]
                      return <li className={`relative`} key={domId}>
                        {(isMobile || !init || group) ?
                          <ResultCard
                            itemId={itemId}
                            hasIiif={hasIiif}
                            distanceMeters={item.distance}
                          />
                          :
                          <ResultItem
                            hit={item}
                          />
                        }
                      </li>
                    })}
                    {/* Table CTA when we cap at `resultLimit=100` */}
                    {isLastPage && shouldShowCappedAtMaxTableViewCta && <>
                    <li className="text-neutral-700 p-4 text-center">

                     Resultata er avgrensa til {MAX_RESULT_LIMIT}.
                     <span className="block mt-1">Gå til tabellvising for å sjå inntil 10 000 treff, eller legg til søkefilter{!sourceViewOn && ' i avansert søk'}.</span>
                   </li>
                      <li className="flex flex-col gap-2 justify-center">
                       
                        <Clickable
                          type="button"
                          add={{ mode: 'table', page: '1' }}
                          remove={['resultLimit']}
                          className={`
                            flex items-center gap-2
                            text-neutral-900
                            bg-neutral-50
                            font-semibold
                            text-xl
                            p-3
                            justify-center w-full
                            transition-colors
                          `}
                        >
                          Tabellvising
                        </Clickable>
                      </li>
                      { !sourceViewOn && (
                      <li className="flex flex-col gap-2 justify-center">

                        <Clickable
                          type="button"
                          add={{ mode: 'table', page: '1' }}
                          remove={['resultLimit']}
                          className={`
                            flex items-center gap-2
                            text-neutral-900
                            bg-neutral-50
                            font-semibold
                            text-xl
                            p-3
                            justify-center w-full
                            transition-colors
                          `}
                        >
                          Avansert søk
                        </Clickable>
                      </li>
                    )}
                    </>}
                    

                    {/* Vis meir button at the end of each page */}
                    {isLastPage &&
                      !shouldShowCappedAtMaxTableViewCta &&
                      effectiveMaxVisibleResults < MAX_RESULT_LIMIT &&
                      (listHasNextPage || totalLoadedResults > effectiveMaxVisibleResults) && (
                      <li className="flex flex-col gap-2 justify-center">
                        <Clickable
                          type="button"
                          add={{
                            resultLimit: Math.min(
                              numericResultLimit + resultLimitIncrement,
                              MAX_RESULT_LIMIT
                            )
                          }}
                          onClick={() => {
                            if (!listIsFetchingNextPage && listHasNextPage) {
                              listFetchNextPage()
                            }
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
                  `}
                          >
                            {listIsFetchingNextPage && <Spinner className="text-white" status="Lastar" />}{' '}
                            {listIsFetchingNextPage ? 'Lastar...' : 'Vis meir'}
                          </Clickable>
                      </li>
                    )}
                  </Fragment>
                )
              })})()}
            </ul>
          )}
        </>
      )}


      {( isMobile || searchError || listError || hasNoResults || hasNoAdditionalResults) && <div className={`flex flex-col gap-4 py-4 pb-8 xl:pb-4`}>
        {filterCount > 0 && <div className="mx-2 mb-4">

          <ActiveFilters /></div>}



        {/* Error and empty states */}
        {(searchError || listError) ? (
          <div className="flex justify-center">
            <div role="status" aria-live="polite" className="text-primary-700 pb-4">
              Det har oppstått ein feil
            </div>
          </div>
        ) : hasNoResults ? (
          <div className="flex justify-center">
            <div role="status" aria-live="polite" className="flex flex-col items-center gap-2 text-neutral-950 pb-4">
              Ingen søkeresultat
              <Link scroll={false} href="/help" className="flex items-center gap-2 px-4 py-3 rounded-md transition-colors no-underline text-neutral-900 hover:bg-accent-100">
                <PiQuestion className="text-xl" aria-hidden="true" />Søketips
              </Link>
            </div>
          </div>
        ) : hasNoAdditionalResults ? (
          <div className="flex justify-center">
            <div role="status" aria-live="polite" className="flex flex-col items-center gap-2 text-neutral-950 pb-4">
              <span>Ingen fleire treff</span>
              <Link scroll={false} href="/help" className="flex items-center gap-2 px-4 py-3 rounded-md transition-colors no-underline text-neutral-900 hover:bg-accent-100">
                <PiQuestion className="text-xl" aria-hidden="true" />Søketips
              </Link>
            </div>
          </div>
        ) : null}
      </div>}
    </div>
  )
}
