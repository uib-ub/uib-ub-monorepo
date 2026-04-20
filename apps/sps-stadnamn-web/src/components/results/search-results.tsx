'use client'
import Clickable from "@/components/ui/clickable/clickable";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import {
  useGroupParam,
  useHideResultsOn,
  useInitParam,
  useNoGeoOn,
  usePoint,
  useQParam,
  useResultLimitNumber,
  useDrawerSnap,
  useSetDrawerSnap,
  useScrollAnchorUuid,
  useSourceViewOn,
} from "@/lib/param-hooks";
import { base64UrlToString } from "@/lib/param-utils";
import { useSearchQuery } from "@/lib/search-params";
import useResultCardData from "@/state/hooks/result-card-data";
import useSearchData from "@/state/hooks/search-data";
import { GlobalContext } from "@/state/providers/global-provider";
import { useNotificationStore } from "@/state/zustand/notification-store";
import { useSessionStore } from "@/state/zustand/session-store";
import Link from "next/link";
import { useContext, useEffect, useRef } from "react";
import { PiCaretLeftBold, PiMagnifyingGlass, PiQuestion, PiX, PiXBold } from "react-icons/pi";
import ResultCard from "@/components/results/card/result-card";
import ActiveFilters from "@/components/results/active-filters";
import ResultItem from "./result-item";
import SearchQueryDisplay from "./search-query-display";
import useListData from "@/state/hooks/list-data";
import { ResultCardSkeleton, ResultItemSkeleton } from "@/components/results/result-skeletons";

import { BATCH_SIZE, FIRST_VISIBLE_RESULTS, STARTING_BATCH_SIZE } from "@/lib/result-limits";
import ResultsHeader from "./results-header";
import ResultsListNavigator from "./results-list-navigator";
import { useSubpostNavigation } from "./use-subpost-navigation";

export default function SearchResults() {
  const { searchError, groupTotalHits, docTotalHits, noGeoGroupCount, totalHits, searchLoading } = useSearchData()
  const resultsContainerRef = useRef<HTMLDivElement>(null)
  const init = useInitParam()
  const group = useGroupParam()
  const qParam = useQParam()
  const sourceViewOn = useSourceViewOn()
  const { resultCardData: initResultCardData, resultCardLoading: initResultCardLoading } = useResultCardData()
  const initValue = init ? base64UrlToString(init) : null
  const { isMobile, scrollableContentRef } = useContext(GlobalContext)
  const point = usePoint()
  const { facetFilters, datasetFilters, searchQueryString } = useSearchQuery()
  const filterCount = facetFilters.length + datasetFilters.length
  const noGeoOn = useNoGeoOn()
  const resultLimitNumber = useResultLimitNumber()
  const resultCount = sourceViewOn ? docTotalHits?.value ?? 0 : groupTotalHits?.value ?? 0
  const resultCountExceptInit = resultCount - (init ? 1 : 0)
  const hideResultsOn = useHideResultsOn()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const removeNotification = useNotificationStore((s) => s.removeNotification)
  const sourceViewResetUrl = useSessionStore((s) => s.sourceViewResetUrl)
  const subpostNav = useSubpostNavigation()
  const scrollFromUrl = useScrollAnchorUuid()
  // One-way sync: capture initial scroll param once and restore at most once.
  // Do NOT "chase" URL updates while the user is scrolling (feedback loop).
  const initialScrollFromUrlRef = useRef<string | null>(scrollFromUrl)
  const didRestoreScrollRef = useRef(false)
  const didPopstateRef = useRef(false)
  const prevRestoreContextRef = useRef<string | null>(null)


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

  useEffect(() => {
    if (init) return
    // Re-arm restore when navigating between result contexts (e.g. entering/leaving subposts),
    // even when navigation is not a browser back/forward event.
    //
    // Important: do NOT include `scrollFromUrl` in this key, since it can change during
    // user scrolling and would re-introduce feedback.
    const key = `${sourceViewOn ? "source" : "group"}|${group ?? ""}|${searchQueryString}`
    if (prevRestoreContextRef.current == null) {
      prevRestoreContextRef.current = key
      return
    }
    if (prevRestoreContextRef.current !== key) {
      prevRestoreContextRef.current = key
      didRestoreScrollRef.current = false
      initialScrollFromUrlRef.current = null
    }
  }, [group, searchQueryString, sourceViewOn])

  useEffect(() => {
    if (init) return
    const onPopstate = () => {
      didPopstateRef.current = true
      // Allow re-capturing/restoring scroll on browser back/forward navigation.
      didRestoreScrollRef.current = false
      initialScrollFromUrlRef.current = null
    }
    window.addEventListener("popstate", onPopstate)
    return () => window.removeEventListener("popstate", onPopstate)
  }, [])

  useEffect(() => {
    if (init) return
    const initialScroll = initialScrollFromUrlRef.current
    // On initial load / hydration / back-forward restore, the scroll param may arrive
    // after first render. Capture the first non-null value once.
    if (initialScroll == null && scrollFromUrl != null) {
      initialScrollFromUrlRef.current = scrollFromUrl
    }
    const effectiveInitialScroll = initialScrollFromUrlRef.current
    if (effectiveInitialScroll == null) return
    if (listLoading) return
    if (!(listStatus === "success" || (typeof listLoadedCount === "number" && listLoadedCount > 0))) return

    if (didRestoreScrollRef.current) return
    // The scroll container can briefly be null or have an unsettle scrollHeight when
    // navigating within /search (e.g. group/subpost). Retry a few frames.
    let cancelled = false
    let attempts = 0
    const maxAttempts = 20

    const applyWhenReady = () => {
      if (cancelled) return
      const el = scrollableContentRef?.current
      if (!el) {
        if (++attempts <= maxAttempts) requestAnimationFrame(applyWhenReady)
        return
      }
      didRestoreScrollRef.current = true
      const target = el.querySelector<HTMLElement>(
        `[data-scroll-uuid="${CSS.escape(effectiveInitialScroll)}"]`,
      )
      if (!target) {
        // If the element isn't in the DOM yet, keep trying for a bit.
        didRestoreScrollRef.current = false
        if (++attempts <= maxAttempts) requestAnimationFrame(applyWhenReady)
        return
      }
      target.scrollIntoView({ block: "start" })
    }

    requestAnimationFrame(applyWhenReady)
    return () => {
      cancelled = true
    }
  }, [scrollFromUrl, listLoading, listLoadedCount, listStatus, scrollableContentRef, searchQueryString])




  // When `init` is present we render it separately, so "additional" means anything beyond the init item.
  const hasNoAdditionalResults =
    listStatus === 'success' && !!init && resultCountExceptInit <= 0

  // Whether to show the "Utan koordinatar" filter control in the options row.
  // Purpose: 
  const firstHasLocation = listData?.pages[0]?.data?.[0]?.fields?.location?.[0]?.coordinates?.length === 2
  const showNoLocationToggle =
    !!point && // results without coordinates are irrelevant if you have a start point but no init
    !!noGeoGroupCount &&
    noGeoGroupCount > 0  && 
    (!init || !!qParam) &&
    (noGeoOn || firstHasLocation);
  const hasResultsError = !!(searchError || listError)
  const isSameCoordinateMode = Boolean(sourceViewOn && init && group)
  const hideSameCoordinateHeaderBar =
    isSameCoordinateMode &&
    typeof subpostNav.sameCoordinateCount === "number" &&
    subpostNav.sameCoordinateCount <= 0 &&
    !(searchLoading || listLoading)

  useEffect(() => {
    if (hasResultsError) {
      addNotification({
        id: "results-fetch-error",
        variant: "error",
        message: "Det har oppstått ein feil: kunne ikkje gjennomføre søket"
      })
    } else {
      removeNotification("results-fetch-error")
    }
    return () => removeNotification("results-fetch-error")
  }, [addNotification, hasResultsError, removeNotification])

  return (
    <div ref={resultsContainerRef} className={isMobile ? 'mb-28' : 'mb-0'}>
      {subpostNav.isSubpostNavigation && <ResultsListNavigator />}
      {init && (initResultCardLoading && !initResultCardData ? (
        <div className="relative">
          <ResultCardSkeleton hasIiif={initResultCardData?.iiifItems?.length > 0} />
        </div>
      ) : initResultCardData && (
        <div className="relative" key={`init-${initValue}`}>
          <ResultCard itemId={init} highlight={initResultCardData.highlight} hasIiif={initResultCardData?.iiifItems?.length > 0} mobilePreview={mobilePreview} />
        </div>
      ))}


      {initResultCardLoading && !initResultCardData ? (
        <div className="w-full border-t border-neutral-200 py-2 px-3 flex items-center gap-2">
          <div className="w-4 h-4 bg-neutral-900/10 rounded-full animate-pulse"></div>
          <div className="h-4 bg-neutral-900/10 rounded-full animate-pulse" style={{ width: '10rem' }}></div>
        </div>
      ) : hideSameCoordinateHeaderBar ? null : (
        <div className={`w-full flex flex-wrap items-center bg-neutral-50 py-2 px-2 gap-y-3 gap-x-2 text-neutral-950 min-w-0 overflow-hidden ${init ? 'border-t border-neutral-200' : ''}`}>
          <div className={`w-full flex flex-wrap`}> <ResultsHeader sameCoordinateCount={subpostNav.sameCoordinateCount} /></div>
          {!hideResultsOn && !group && (sourceViewOn || point || init) && <>
          {qParam ? (
            <Clickable
              remove={['q', 'searchSort']}
              add={{ q: null  }}
              className="h-9 px-2 rounded-md bg-white border border-neutral-200 flex items-center gap-1 cursor-pointer max-w-full min-w-0"
            >
              <PiMagnifyingGlass className="text-lg" aria-hidden="true" />
              <span className="truncate flex-1 min-w-0 max-w-full block">
                {qParam}
              </span>
              <PiX className="text-lg" aria-hidden="true" />
            </Clickable>
          ) : null}
          { point && !init && (
            <Clickable
              remove={['point', 'noGeo']}
              className="h-9 px-2 rounded-md bg-white border border-neutral-200 flex items-center gap-1 cursor-pointer max-w-full min-w-0"
            >
              <img src="/currentLocation.svg" alt="" aria-hidden="true" className="w-6 h-6 mb-1 self-center" />
              <span className="truncate flex-1 min-w-0 max-w-full block">Startpunkt</span>
              <PiX className="text-lg" aria-hidden="true" />
            </Clickable>
          )}

          {/* Toolbar items share the same flex row as the chip so they wrap together. */}
          {(qParam || point) && <SearchQueryDisplay
            showNoLocationToggle={showNoLocationToggle}
            noGeoGroupCount={noGeoGroupCount ?? 0}
          />}
          </>}
        </div>
      )}
      

      {!mobilePreview && !hideResultsOn && (
        <>
          <ul id="result_list" aria-label= {sourceViewOn ? 'Fleire kjeldepostar' : 'Fleire namnegrupper'} className={`flex flex-col divide-y divide-neutral-200 border-y border-neutral-200`}>
            {subpostNav.isSubpostNavigation ? (
              <>
                {subpostNav.sameCoordinateHits.map((hit, i) => (
                  <li
                    key={`samecoord-${hit?.fields?.uuid?.[0] ?? i}`}
                    className="relative"
                    data-scroll-uuid={hit?.fields?.uuid?.[0] ?? undefined}
                  >
                    <ResultItem hit={hit} />
                  </li>
                ))}

                {subpostNav.isFetching && (
                  <li className="relative">
                    <ResultItemSkeleton />
                  </li>
                )}
              </>
            ) : Array.from({
              length: resultLimitNumber ||
                Math.min(
                  resultCountExceptInit,
                  (init ? FIRST_VISIBLE_RESULTS : STARTING_BATCH_SIZE) + 1
                )
            }).map((_, i) => {


              let body = null
              const targetResultCount = init ? resultCountExceptInit : resultCount
              const hasMoreResults = listLoadedCount && listLoadedCount < targetResultCount
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
                if (!init || noGeoOn) {
                  body = (
                    <ResultCard
                      itemId={itemData.fields.uuid[0]}
                      hasIiif={hasIiif}
                      distanceMeters={itemData.distance}
                      highlight={itemData.highlight}
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
                body = <>{(isMobile || !init || noGeoOn || group)
                  ? <ResultCardSkeleton hasIiif={hasIiif} />
                  : <ResultItemSkeleton />
                }</>
              }
              else {
                return null
                //body = <div key={`result-${i}`} className="relative">TOMT</div>
              }

              return (
                <li
                  key={`result-${i}-${itemData?.fields?.uuid?.[0]}`}
                  className="relative"
                  data-scroll-uuid={itemData?.fields?.uuid?.[0] ?? undefined}
                >
                  {body}
                </li>
              )
            })}

          </ul>
          {(isMobile ||
            searchError ||
            listError ||
            totalHits?.value == 0 ||
            hasNoAdditionalResults) && (
              <div className={`flex flex-col gap-4 py-4 pb-8 xl:pb-4`}>
                {filterCount > 0 && (
                  <div className="mx-2 mb-4">
                    <ActiveFilters />
                  </div>
                )}

                {/* Empty states */}
                {!hasResultsError &&
                  <div className="flex justify-center flex-col gap-4">
                    {
                      group && totalHits?.value == 0 && <div className="flex justify-center">
                      <div className="flex flex-col items-center gap-4 text-neutral-950">
                        <p className="text-neutral-950">Ingen resultat i denne namnegruppa</p>
                        <Clickable className="flex items-center gap-2 btn btn-neutral" remove={['group', 'sourceView']}>
                          <PiMagnifyingGlass aria-hidden="true" className="text-white"/>
                          Søk i alle namnegrupper
                        </Clickable>
                      </div>
                    </div>}
                    <div
                      className="flex flex-col items-center gap-2 text-neutral-950"
                    >
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
                }

                
              </div>
            )}
        </>
      )}
    </div>
  )
}
