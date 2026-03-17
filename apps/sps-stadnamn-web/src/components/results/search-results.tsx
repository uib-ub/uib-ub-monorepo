'use client'
import Spinner from "@/components/svg/Spinner";
import Clickable from "@/components/ui/clickable/clickable";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import { SM_BASE_MAX_RESULTS } from "@/lib/utils";
import { usePoint } from "@/lib/param-hooks";
import { base64UrlToString, stringToBase64Url } from "@/lib/param-utils";
import { useSearchQuery } from "@/lib/search-params";
import useGroupData from "@/state/hooks/group-data";
import useSearchData from "@/state/hooks/search-data";
import { GlobalContext } from "@/state/providers/global-provider";
import { useSessionStore } from "@/state/zustand/session-store";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams()
  const init = searchParams.get('init')
  const group = searchParams.get('group')
  const qParam = searchParams.get('q')?.trim()
  const resultsParam = parseInt(searchParams.get('maxResults') || '0')
  const sourceView = searchParams.get('sourceView') === 'on'
  const { groupData } = useGroupData(group)
  const { groupData: initGroupData, groupLoading: initGroupLoading } = useGroupData(init)
  const initValue = init ? base64UrlToString(init) : null
  // In grouped view, init points to a group id (base64 encoded).
  // In non-grouped view, init points to a source uuid, so we must derive the
  // corresponding group id from grouped init data to exclude it from collapsed results.
  const initGroupId = init
    ? (initGroupData?.id ?? (!sourceView ? initValue : null))
    : (!sourceView ? initValue : null)
  const initHasCoordinates = initGroupData?.fields?.location?.coordinates?.length >= 2
  const snappedPosition = useSessionStore((s) => s.snappedPosition)
  const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition)
  const setInitGroupLabel = useSessionStore((s) => s.setInitGroupLabel)
  const { isMobile, mapFunctionRef } = useContext(GlobalContext)
  const point = usePoint()
  const { facetFilters, datasetFilters } = useSearchQuery()
  const filterCount = facetFilters.length + datasetFilters.length
  const noGeo = searchParams.get('noGeo') === 'on'


  // Ensure the map has a label available for the init anchor marker even
  // when init/point come from URL or list interactions (not just map clicks).
  // We tie the cached label to the current point; the map will only render
  // the anchor when both label and point match its own props.
  useEffect(() => {
    if (!init || !point) {
      setInitGroupLabel(null, null)
      return
    }

    // If the init group data is still loading, keep any label that might have
    // been set by a map click so the anchor marker can render immediately.
    if (initGroupLoading) {
      return
    }

    const label =
      initGroupData?.label ??
      initGroupData?.fields?.label?.[0] ??
      initGroupData?.fields?.["group.label"]?.[0] ??
      null
    if (typeof label === "string" && label.trim()) {
      setInitGroupLabel(label, point)
    } else {
      setInitGroupLabel(null, null)
    }
  }, [init, point, initGroupLoading, initGroupData?.label, initGroupData?.fields, setInitGroupLabel])

  const {
    listData,
    listError,
    listLoading,
    listFetchNextPage,
    listHasNextPage,
    listIsFetchingNextPage,
    listStatus,
    listInitialPage,
    listPageSize,
    mobilePreview,
  } = useListData()

  // Helper: count additional results.
  // In grouped mode we can rely on cardinality: total groups minus the init group.
  const additionalResultsCount = useMemo(() => {
    if (!listData) return 0

    // In source-view (document mode), fall back to counting documents excluding the init uuid.
    if (sourceView) {
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
  const hasOneResult = listStatus === 'success' && listData?.pages && listData.pages.length === 1 && listData.pages[0].data?.length === 1;
  const hasNoAdditionalResults =
    listStatus === 'success' &&
    !!init &&
    additionalResultsCount === 0
  const hasMaxResultsParam = resultsParam > 0

  // Maximum number of list items to show, driven directly by the maxResults URL param.
  // If no valid param is present, show everything that has been loaded.
  const maxVisibleResults = resultsParam > 0 ? resultsParam : SM_BASE_MAX_RESULTS;

  // Total number of results that have been loaded from the API so far.
  const totalLoadedResults = useMemo(() => {
    if (!listData) return 0;
    return (listData.pages as any[]).reduce((acc, page: any) => {
      return acc + (page.data?.length ?? 0);
    }, 0);
  }, [listData]);

  // Derived: do all currently rendered results have coordinates?
  // We mirror the same maxVisibleResults cut-off as the renderer.
  const allVisibleHaveLocation = useMemo(() => {
    if (!listData) return false;
    let seen = 0;
    for (const page of (listData as any).pages || []) {
      for (const item of page.data || []) {
        if (seen >= maxVisibleResults) {
          return true;
        }
        const loc = item.fields?.location?.[0]?.coordinates;
        if (!Array.isArray(loc) || loc.length !== 2) {
          return false;
        }
        seen += 1;
      }
    }
    // If we have rendered at least one item and none lacked coordinates,
    // treat this as "all visible have location".
    return seen > 0;
  }, [listData, maxVisibleResults]);

  // Whether to show the "Utan koordinatar" filter control in the options row.
  const showNoLocationToggle =
    !!init &&
    initHasCoordinates &&
    !sourceView &&
    !!noGeoGroupCount &&
    noGeoGroupCount > 0 &&
    (noGeo || allVisibleHaveLocation);

  // Derived: should "Fleire namnegrupper" and the list of other groups be visible?
  // For init on desktop, this is controlled solely by resultsParam (>1 means expanded).
  const showOtherResults = (!init || isMobile || hasOneResult)
    ? true
    : hasMaxResultsParam;



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
      {init && !group && (initGroupLoading ? (
        <div className="relative">
          <ResultCardSkeleton hasIiif={initGroupData?.iiifItems?.length > 0} />
        </div>
      ) : initGroupData && (
        <div className="relative" key={`init-${initValue}`}>
          <ResultCard id={`result-card-${init}`} overrideGroupCode={init || undefined} hasIiif={initGroupData?.iiifItems?.length > 0} mobilePreview={mobilePreview} />
        </div>
      ))}


      {(init || qParam)? (initGroupLoading ? (
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
                {sourceView ? 'Fleire kjeldeoppslag' : 'Fleire namnegrupper'}
              </span>

            </>
          )}

          {/* Toolbar items share the same flex row as the chip so they wrap together. */}
          {searchParams.get('q') && <SearchQueryDisplay
            showNoLocationToggle={showNoLocationToggle}
            noGeoGroupCount={noGeoGroupCount ?? 0}
          />}
        </div>
      )) : null}

      {(!init || showOtherResults || isMobile || hasOneResult) && !mobilePreview && (
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
                      if (renderedCount >= maxVisibleResults) return null
                      if (!sourceView && !item.fields["group.id"]) {
                        console.log("No group ID", item);
                        return null
                      }
                      renderedCount += 1
                      const groupId = item.fields['group.id']?.[0]
                      const uuid = item.fields['uuid']?.[0]
                      const groupCode = sourceView ? uuid : groupId
                      const domId = uuid || groupId
                      const hasIiif = !!item.fields['iiif']?.[0]
                      return <li className={`relative`} key={domId}>
                        {(isMobile || !init || group) ?
                          <ResultCard
                            id={`result-card-${domId}`}
                            overrideGroupCode={groupCode}
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
                    {/* Vis meir button at the end of each page */}
                    {isLastPage && (listHasNextPage || totalLoadedResults > maxVisibleResults) && (
                      <li className="flex flex-col gap-2 justify-center">
                        <Clickable
                          type="button"
                          add={{
                            maxResults: String(
                                (() => {
                                  const current = resultsParam || listPageSize
                                  const increase = Math.min(Math.round(current * 1.5), 100)
                                  return current + increase
                                })()
                              
                            ),
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


      {( isMobile || searchError || listError || hasNoResults || hasNoAdditionalResults) && <div className={`flex flex-col gap-4 ${(init && !isMobile && !showOtherResults) ? '' : 'py-4 pb-8 xl:pb-4'}`}>
        {filterCount > 0 && showOtherResults && <div className="mx-2 mb-4">

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
