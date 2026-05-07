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
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { PiArrowElbowLeftUpBold, PiCaretLeftBold, PiCaretRightBold, PiMagnifyingGlass, PiQuestion, PiX } from "react-icons/pi";
import ResultCard from "@/components/results/card/result-card";
import ActiveFilters from "@/components/results/active-filters";
import ResultItem from "./result-item";
import SearchQueryDisplay from "./search-query-display";
import useListData from "@/state/hooks/list-data";
import { ResultCardSkeleton, ResultItemSkeleton } from "@/components/results/result-skeletons";
import Spinner from "@/components/svg/Spinner";

import { BATCH_SIZE, FIRST_VISIBLE_RESULTS, STARTING_BATCH_SIZE } from "@/lib/result-limits";
import ResultsHeader from "./results-header";
import { useSubpostNavigation } from "./use-subpost-navigation";
import { useResultsScrollRestore, useScrollIndexParam } from "@/components/results/scroll-hooks";

export default function SearchResults() {
  const { searchError, groupTotalHits, docTotalHits, noGeoGroupCount, totalHits, searchLoading } = useSearchData()
  const router = useRouter()
  const searchParams = useSearchParams()
  const resultsContainerRef = useRef<HTMLDivElement>(null)
  const init = useInitParam()
  const group = useGroupParam()
  const qParam = useQParam()
  const sourceViewOn = useSourceViewOn()
  const { resultCardData: initResultCardData, resultCardLoading: initResultCardLoading } = useResultCardData()
  const { resultCardData: navigationGroupCardData } = useResultCardData(group, { forceGroupLookup: true })
  const initValue = init ? base64UrlToString(init) : null
  const { isMobile, scrollableContentRef, parentSearchUrl, mapFunctionRef } = useContext(GlobalContext)
  const point = usePoint()
  const { facetFilters, datasetFilters, searchQueryString, searchQuery } = useSearchQuery()
  const filterCount = facetFilters.length + datasetFilters.length
  const noGeoOn = useNoGeoOn()
  const resultLimitNumber = useResultLimitNumber()
  const resultCount = sourceViewOn ? docTotalHits?.value ?? 0 : groupTotalHits?.value ?? 0
  const resultCountExceptInit = resultCount - (init ? 1 : 0)
  const hideResultsOn = useHideResultsOn()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const removeNotification = useNotificationStore((s) => s.removeNotification)
  const subpostNav = useSubpostNavigation()
  const scrollIndex = useScrollIndexParam("scroll")
  const { setRowRef, onLoadingChangeForIndex } = useResultsScrollRestore({
    scrollIndex,
    sourceViewOn: Boolean(sourceViewOn),
    initOn: Boolean(init),
    scrollableContentRef,
  })

  const {
    listData,
    listLoadedCount,
    listError,
    listLoading,
    listFetchNextPage,
    listIsFetchingNextPage,
    listStatus,
    mobilePreview,
  } = useListData()

  // When `init` is present we render it separately, so "additional" means anything beyond the init item.
  // Do not render the "Andre treff" section until we know how many additional results exist.
  const hasCalculatedAdditionalResults = !init || listStatus === 'success'
  const hasNoAdditionalResults =
    hasCalculatedAdditionalResults && !!init && resultCountExceptInit <= 0
  const showAdditionalResultsSection =
    hasCalculatedAdditionalResults && !hasNoAdditionalResults

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
  const showNavigationTopBar = subpostNav.isSubpostNavigation
  const shouldShowNavigationBody = true
  const showLegacyUnderpostarWithoutInit = Boolean(sourceViewOn && group && !init)
  const showNoResultsFallback = totalHits?.value === 0
  const navGroupFields = navigationGroupCardData?.fields || {}
  const navGroupToText = (value: unknown): string => {
    if (Array.isArray(value)) return value.filter(Boolean).join(" | ")
    return typeof value === "string" ? value : ""
  }
  const navGroupTitle = typeof navigationGroupCardData?.label === "string" ? navigationGroupCardData.label : ""
  const navGroupAdm1 = navGroupToText((navGroupFields as any).adm1)
  const navGroupAdm2 = navGroupToText((navGroupFields as any).adm2)
  const navGroupAdmText = [navGroupAdm2, navGroupAdm1].filter(Boolean).join(", ")
  const showTopBarNavigator = showNavigationTopBar && subpostNav.items.length > 1
  const topBarNavBadge = subpostNav.currentIndex !== -1
    ? `${subpostNav.currentIndex + 1} / ${subpostNav.items.length}`
    : `– / ${subpostNav.items.length}`
  const [isJumpInputOpen, setIsJumpInputOpen] = useState(false)
  const [jumpInputValue, setJumpInputValue] = useState("")
  const jumpInputRef = useRef<HTMLInputElement>(null)

  const flyToPoint = (pointValue: string | null) => {
    if (!pointValue || !mapFunctionRef.current) return
    const [latRaw, lngRaw] = pointValue.split(",")
    const lat = Number(latRaw)
    const lng = Number(lngRaw)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
    mapFunctionRef.current.flyTo?.([lat, lng], 15)
  }

  const jumpToNavigationIndex = (targetIndex: number) => {
    const total = subpostNav.items.length
    if (!total) return
    if (!Number.isFinite(targetIndex)) return
    const clamped = Math.min(total, Math.max(1, targetIndex))
    const selectedItem = subpostNav.items[clamped - 1]
    if (!selectedItem?.id) return

    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.set("init", selectedItem.id)
    if (selectedItem.point) {
      nextParams.set("point", selectedItem.point)
      nextParams.set("activePoint", selectedItem.point)
      nextParams.set("center", selectedItem.point)
      nextParams.set("zoom", "15")
      flyToPoint(selectedItem.point)
    } else {
      nextParams.delete("activePoint")
    }
    nextParams.delete("activeYear")
    nextParams.delete("activeName")
    router.push(`?${nextParams.toString()}`, { scroll: false })
  }

  const openJumpInput = () => {
    const currentDisplayIndex = subpostNav.currentIndex >= 0 ? subpostNav.currentIndex + 1 : 1
    setJumpInputValue(String(currentDisplayIndex))
    setIsJumpInputOpen(true)
  }

  const closeJumpInput = () => {
    setIsJumpInputOpen(false)
  }

  const submitJumpInput = () => {
    const parsed = Number.parseInt(jumpInputValue, 10)
    if (!Number.isFinite(parsed)) return
    jumpToNavigationIndex(parsed)
    setIsJumpInputOpen(false)
  }

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

  useEffect(() => {
    if (!sourceViewOn || !group) return
    let nextInitId: string | null = null
    let nextActivePoint: string | null = null

    if (!init) {
      if (listLoading) return
      const firstHit = listData?.pages?.[0]?.data?.[0]
      const firstHitId = firstHit?.fields?.uuid?.[0]
      if (typeof firstHitId !== "string" || !firstHitId.trim()) return
      nextInitId = firstHitId

      const firstCoords = firstHit?.fields?.location?.[0]?.coordinates
      if (
        Array.isArray(firstCoords) &&
        firstCoords.length === 2 &&
        Number.isFinite(Number(firstCoords[0])) &&
        Number.isFinite(Number(firstCoords[1]))
      ) {
        nextActivePoint = `${firstCoords[1]},${firstCoords[0]}`
      }
    } else {
      if (subpostNav.isFetching) return
      if (subpostNav.currentIndex !== -1) return
      const firstNavItem = subpostNav.items[0]
      if (!firstNavItem?.id) return
      nextInitId = firstNavItem.id
      nextActivePoint = firstNavItem.point
    }

    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.set("init", nextInitId)
    if (nextActivePoint) {
      nextParams.set("activePoint", nextActivePoint)
    } else {
      nextParams.delete("activePoint")
    }

    if (nextParams.toString() === searchParams.toString()) return
    router.replace(`?${nextParams.toString()}`, { scroll: false })
  }, [group, init, listData, listLoading, router, searchParams, sourceViewOn, subpostNav.currentIndex, subpostNav.isFetching, subpostNav.items])

  useEffect(() => {
    if (!isJumpInputOpen) return
    jumpInputRef.current?.focus()
    jumpInputRef.current?.select()
  }, [isJumpInputOpen])

  return (
    <div ref={resultsContainerRef} className={isMobile ? 'mb-28' : 'mb-0'}>
      {showNavigationTopBar && (
        <div className="w-full bg-neutral-50 rounded-t-md border-b border-neutral-200 px-2 py-2">
          <div className="w-full flex items-center">
            <div className="flex items-center gap-2 xl:px-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                {navGroupTitle ? (
                  <span className="text-base xl:text-lg font-semibold truncate min-w-0">{navGroupTitle}</span>
                ) : (
                  <span className="text-base xl:text-lg text-neutral-900 font-sans font-semibold truncate">Underpostar</span>
                )}
                {isJumpInputOpen ? (
                  <div className="flex items-center gap-1">
                    <label htmlFor="jump-to-number-input" className="sr-only">Gå til nummer</label>
                    <input
                      ref={jumpInputRef}
                      id="jump-to-number-input"
                      type="number"
                      min={1}
                      max={subpostNav.items.length}
                      value={jumpInputValue}
                      onChange={(e) => setJumpInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          submitJumpInput()
                        }
                        if (e.key === "Escape") {
                          e.preventDefault()
                          closeJumpInput()
                        }
                      }}
                      className="h-7 w-20 rounded-md border border-neutral-300 px-2 text-sm"
                      aria-label={`Gå til nummer mellom 1 og ${subpostNav.items.length}`}
                    />
                    <button
                      type="button"
                      onClick={submitJumpInput}
                      className="inline-flex h-7 px-2 items-center justify-center rounded-md bg-neutral-700 text-white text-xs font-semibold hover:bg-neutral-800"
                    >
                      Gå
                    </button>
                    <button
                      type="button"
                      onClick={closeJumpInput}
                      className="inline-flex h-7 px-2 items-center justify-center rounded-md border border-neutral-300 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
                    >
                      Avbryt
                    </button>
                  </div>
                ) : subpostNav.isFetching ? (
                  <span className="inline-flex min-w-[1.75rem] h-6 items-center justify-center">
                    <Spinner status="Laster navigering" className="text-base text-primary-700" />
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={openJumpInput}
                    className="inline-flex min-w-[1.75rem] h-6 px-2 items-center justify-center rounded-full bg-neutral-700 text-white text-sm font-semibold tabular-nums hover:bg-neutral-800"
                    aria-label="Gå til nummer i navigering"
                  >
                    {topBarNavBadge}
                  </button>
                )}
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {showTopBarNavigator && (
                <>
                  <ClickableIcon
                    label="Førre"
                    add={{ init: subpostNav.prevId, point: subpostNav.prevPoint, activePoint: subpostNav.prevPoint, center: subpostNav.prevPoint, zoom: "15" }}
                    remove={["activeYear", "activeName"]}
                    onClick={() => flyToPoint(subpostNav.prevPoint)}
                    notClickable={!subpostNav.prevId || subpostNav.isFetching}
                    className="btn btn-outline btn-compact rounded-full w-9 h-9 flex items-center justify-center border-neutral-200 bg-white shadow-none"
                  >
                    <PiCaretLeftBold aria-hidden="true" className="text-base" />
                  </ClickableIcon>
                  <ClickableIcon
                    label="Neste"
                    add={{ init: subpostNav.nextId, point: subpostNav.nextPoint, activePoint: subpostNav.nextPoint, center: subpostNav.nextPoint, zoom: "15" }}
                    remove={["activeYear", "activeName"]}
                    onClick={() => flyToPoint(subpostNav.nextPoint)}
                    notClickable={!subpostNav.nextId || subpostNav.isFetching}
                    className="btn btn-outline btn-compact rounded-full w-9 h-9 flex items-center justify-center border-neutral-200 bg-white shadow-none"
                  >
                    <PiCaretRightBold aria-hidden="true" className="text-base" />
                  </ClickableIcon>
                </>
              )}
              {parentSearchUrl?.current ? (
                <ClickableIcon
                  label="Overordna søk"
                  href={parentSearchUrl.current || "/search"}
                  className="btn btn-outline rounded-full text-neutral-900 p-2"
                >
                  <PiArrowElbowLeftUpBold aria-hidden="true" className="text-lg text-neutral-800" />
                </ClickableIcon>
              ) : (
                <ClickableIcon
                  label="Overordna søk"
                  remove={["group", "sourceView", "init"]}
                  className="btn btn-outline rounded-full text-neutral-900 p-2"
                >
                  <PiArrowElbowLeftUpBold aria-hidden="true" className="text-lg text-neutral-800" />
                </ClickableIcon>
              )}
            </div>
          </div>
        </div>
      )}
      {shouldShowNavigationBody && init && (initResultCardLoading && !initResultCardData ? (
        <div className="relative">
          <ResultCardSkeleton hasIiif={initResultCardData?.iiifItems?.length > 0} />
        </div>
      ) : initResultCardData && (
        <div className="relative" key={`init-${initValue}`}>
          <ResultCard itemId={init} highlight={initResultCardData.highlight} hasIiif={initResultCardData?.iiifItems?.length > 0} mobilePreview={mobilePreview} />
        </div>
      ))}


      {shouldShowNavigationBody && showAdditionalResultsSection && !showLegacyUnderpostarWithoutInit && (initResultCardLoading && !initResultCardData ? (
        <div className="w-full border-t border-neutral-200 py-2 px-3 flex items-center gap-2">
          <div className="w-4 h-4 bg-neutral-900/10 rounded-full animate-pulse"></div>
          <div className="h-4 bg-neutral-900/10 rounded-full animate-pulse" style={{ width: '10rem' }}></div>
        </div>
      ) : (
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
      ))}

      
      {showAdditionalResultsSection && !showLegacyUnderpostarWithoutInit && !mobilePreview && !hideResultsOn && (
        <>
          <ul
            id="result_list"
            aria-label={sourceViewOn ? 'Fleire kjeldepostar' : 'Fleire namnegrupper'}
            className={`flex flex-col divide-y divide-neutral-200 border-y border-neutral-200`}
          >
            {Array.from({
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
                const renderCardResult = !init || noGeoOn
                if (renderCardResult) {
                  const uuid = itemData.fields.uuid[0]
                  const isActive = scrollIndex === i
                  body = (
                    <div
                      ref={setRowRef(i)}
                      data-result-uuid={uuid}
                      className={
                        isActive
                          ? "bg-accent-50"
                          : ""
                      }
                    >
                      <ResultCard
                        itemId={itemData.fields.uuid[0]}
                        scrollIndex={i}
                        hasIiif={hasIiif}
                        distanceMeters={itemData.distance}
                        highlight={itemData.highlight}
                        onLoadingChange={onLoadingChangeForIndex(i)}
                      />
                    </div>
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
                <li key={`result-${i}-${itemData?.fields?.uuid?.[0]}`} className="relative">
                  {body}
                </li>
              )
            })}

          </ul>
        </>
      )}
      {((isMobile ||
        searchError ||
        listError ||
        showNoResultsFallback ||
        hasNoAdditionalResults) &&
        (!showLegacyUnderpostarWithoutInit || showNoResultsFallback)) && (
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
                group && showNoResultsFallback && <div className="flex justify-center">
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
    </div>
  )
}
