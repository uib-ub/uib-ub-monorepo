'use client'
import Spinner from "@/components/svg/Spinner";
import Clickable from "@/components/ui/clickable/clickable";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import { datasetTitles } from "@/config/metadata-config";
import { useGroup } from "@/lib/param-hooks";
import { base64UrlToString, stringToBase64Url } from "@/lib/param-utils";
import { useSearchQuery } from "@/lib/search-params";
import { getSkeletonLength } from "@/lib/utils";
import useCollapsedData, { SUBSEQUENT_PAGE_SIZE } from "@/state/hooks/collapsed-data";
import useGroupData from "@/state/hooks/group-data";
import useSearchData from "@/state/hooks/search-data";
import { GlobalContext } from "@/state/providers/global-provider";
import { useSessionStore } from "@/state/zustand/session-store";
import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { PiCheck, PiMapPinFill, PiMinusBold, PiPencilSimpleBold, PiPlayFill, PiPlusBold, PiX, PiXBold } from "react-icons/pi";
import GroupInfo from "../../details/group/group-info";
import ActiveFilters from "../../form/active-filters";
import ResultItem from "./result-item";
import SearchQueryDisplay from "./search-query-display";



const CollapsibleResultItem = ({ hit, activeGroupValue }: { hit: any, activeGroupValue: string | null }) => {

  const [expanded, setExpanded] = useState(activeGroupValue == hit.fields["group.id"][0])
  const groupCode = stringToBase64Url(hit.fields["group.id"][0])
  return (
    <li className="relative" key={hit.fields["group.id"][0]}>
      <ResultItem hit={hit} onClick={() => setExpanded(!expanded)} aria-controls={`group-info-${hit.fields["group.id"][0]}`} aria-expanded={expanded} />
      {expanded && <GroupInfo id={`group-info-${hit.fields["group.id"][0]}`} overrideGroupCode={groupCode} />}
    </li>
  )
}

export default function SearchResults() {
  const { searchError } = useSearchData()
  const resultsContainerRef = useRef<HTMLDivElement>(null)
  const { activeGroupValue } = useGroup()
  const searchParams = useSearchParams()
  const init = searchParams.get('init')
  const group = searchParams.get('group')
  const resultsParam = parseInt(searchParams.get('results') || '0') || 0
  const initValue = init ? base64UrlToString(init) : null
  const { groupData: initGroupData, groupLoading: initGroupLoading } = useGroupData(init)
  const { groupData: activeGroupData } = useGroupData()
  const snappedPosition = useSessionStore((s) => s.snappedPosition)
  const { isMobile, sosiVocab, mapFunctionRef } = useContext(GlobalContext)
  const point = searchParams.get('point') ? (searchParams.get('point')!.split(',').map(parseFloat) as [number, number]) : null
  const { facetFilters, datasetFilters } = useSearchQuery()
  const filterCount = facetFilters.length + datasetFilters.length
  const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition)
  // State for inline coordinate editing
  const [isEditingCoordinates, setIsEditingCoordinates] = useState(false)
  const [editLat, setEditLat] = useState('')
  const [editLon, setEditLon] = useState('')
  const previousPointRef = useRef<string | null>(null)
  const { totalHits } = useSearchData()
  const router = useRouter()

  // Unified function to stop editing
  const stopEditingCoordinates = () => {
    setIsEditingCoordinates(false)
    setEditLat('')
    setEditLon('')
  }

  // Stop editing when coordinates change from external sources (e.g., map interaction)
  useEffect(() => {
    const currentPointString = point ? `${point[0]},${point[1]}` : null

    // Only stop editing if:
    // 1. We're currently editing
    // 2. The point exists
    // 3. The point actually changed (not just initial render)
    if (isEditingCoordinates && point && previousPointRef.current !== null && previousPointRef.current !== currentPointString) {
      stopEditingCoordinates()
    }

    // Update the ref to track the current point
    previousPointRef.current = currentPointString
  }, [point, isEditingCoordinates])

  // Functions for coordinate editing
  const startEditingCoordinates = () => {
    if (point) {
      setEditLat(point[1].toFixed(5)) // lat is second in point array
      setEditLon(point[0].toFixed(5)) // lon is first in point array
    } else {
      const sourceWithLocation = activeGroupData?.sources?.find((source: any) => source.location?.coordinates)
      if (sourceWithLocation?.location?.coordinates) {
        const [lon, lat] = sourceWithLocation.location.coordinates
        setEditLat(lat.toFixed(5))
        setEditLon(lon.toFixed(5))
      } else {
        setEditLat('')
        setEditLon('')
      }
    }
    setIsEditingCoordinates(true)
  }

  const cancelEditingCoordinates = () => {
    stopEditingCoordinates()
  }

  const saveCoordinates = () => {
    const lat = parseFloat(editLat)
    const lon = parseFloat(editLon)

    if (!isNaN(lat) && !isNaN(lon)) {
      // Update URL with new coordinates
      const newParams = new URLSearchParams(searchParams)
      //newParams.set('point', `${lon},${lat}`)
      router.push(`?${newParams.toString()}`)
      stopEditingCoordinates()
    }
  }

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

  // Helper: count additional groups (excluding init group when present)
  const getAdditionalResultsCount = () => {
    if (!collapsedData) return 0
    const allHits = collapsedData.pages.flatMap((page: any) => page.data || [])
    if (!initValue) {
      return allHits.length
    }
    return allHits.filter((hit: any) => hit.fields?.["group.id"]?.[0] !== initValue).length
  }

  // Check if there are no results
  const hasNoResults = collapsedStatus === 'success' && (!collapsedData?.pages || collapsedData.pages.length === 0 || collapsedData.pages[0].data?.length === 0);
  const hasOneResult = collapsedStatus === 'success' && collapsedData?.pages && collapsedData.pages.length === 1 && collapsedData.pages[0].data?.length === 1;

  // Derived: should "Fleire namnegrupper" and the list of other groups be visible?
  // For init on desktop, this is controlled solely by resultsParam (>1 means expanded).
  const showOtherResults = (!init || isMobile || hasOneResult)
    ? true
    : (resultsParam > 1);

  useEffect(() => {
    if (!hasOneResult) return

    const onlyResultId = collapsedData?.pages?.[0]?.data?.[0]?.fields?.["group.id"]?.[0]
    if (!onlyResultId) return

    const onlyResultCode = stringToBase64Url(onlyResultId)
    const initMatches = init === onlyResultCode
    const groupMatches = group === onlyResultCode

    if (initMatches && !group) return

    const newParams = new URLSearchParams(searchParams)
    newParams.set('init', onlyResultCode)
    newParams.delete('group')
    router.replace(`?${newParams.toString()}`)
  }, [collapsedData, group, hasOneResult, init, router, searchParams])


  if (isMobile && activeGroupValue && snappedPosition == 'bottom') {

    if (!activeGroupData) return null;

    const label = activeGroupData?.fields?.label?.[0]
    const datasets: string[] = []
    const seenDatasets = new Set<string>()
    const audioItems: any[] = []

    // Collect other labels with priority: source.label > altLabels > attestation labels (if list isn't too long)
    const mainLabel = label

    // First: Collect source.label values that differ from the main label
    const sourceLabels = Array.from(new Set(
      (activeGroupData?.sources || [])
        .map((src: any) => src.label)
        .filter((label: string) => label && label !== mainLabel)
    ))

    // Second: Add altLabels from fields
    const altLabels = activeGroupData?.fields?.altLabels || []

    // Combine source labels and alt labels first
    const otherLabels = [...sourceLabels, ...altLabels]
      .filter(label => label && label !== mainLabel)

    // Third: Add attestation labels only if the list isn't too long already (limit to 5 total)
    const attestationLabels = (activeGroupData?.sources || []).flatMap((src: any) =>
      src.attestations?.map((att: any) => att.label) ?? []
    )

    const uniqueAttestationLabels = Array.from(new Set(attestationLabels))
      .filter(label => label && label !== mainLabel && !otherLabels.includes(label))

    // Add attestation labels one by one until we reach the limit
    for (const attestLabel of uniqueAttestationLabels) {
      if (otherLabels.length < 5) {
        otherLabels.push(attestLabel)
      } else {
        break
      }
    }

    // Collect unique sosi place types from all sources and map to vocabulary
    const sosiTypesRaw = Array.from(new Set(
      (activeGroupData?.sources || [])
        .flatMap((src: any) => {
          if (!src.sosi) return []
          return Array.isArray(src.sosi) ? src.sosi : [src.sosi]
        })
        .filter((sosi: string) => sosi)
    )) as string[]
    const sosiTypes = sosiTypesRaw.map((type: string) => sosiVocab[type]?.label || type)

    activeGroupData?.sources?.forEach((source: any) => {
      if (!seenDatasets.has(source.dataset)) {
        datasets.push(source.dataset)
        seenDatasets.add(source.dataset)
      }
      if (source.recordings) {
        audioItems.push(source)
      }
    })

    let secondaryTitle = "";
    if (datasets.length > 1) {
      const firstDs = datasets[0]!;
      const restCount = datasets.length - 1;
      secondaryTitle = `${datasetTitles[firstDs] || firstDs} +${restCount}`;
    } else {
      secondaryTitle = datasetTitles[datasets[0]!] || datasets[0]!;
    }

    const handlePlayAudio = (recording: any) => {
      const audio = new Audio(`https://iiif.spraksamlingane.no/iiif/audio/hord/${recording.file}`)
      audio.play().catch(console.error)
    }

    return <div className="px-2 h-[100vh]">
      <div className="flex items-center gap-2">
        <strong>{label}</strong>
        {sosiTypes.length > 0 && (
          <span className="text-neutral-700 text-sm truncate">
            {sosiTypes.slice(0, 3).join(', ')}{sosiTypes.length > 3 && '...'}
          </span>
        )}
        {audioItems.length > 0 && (
          <div className="flex gap-1 ml-auto flex-shrink-0">
            {audioItems.map((audioItem) =>
              audioItem.recordings.map((recording: any) => (
                <button
                  key={"audio-preview-" + recording.uuid}
                  onClick={() => handlePlayAudio(recording)}
                  className="p-1 text-primary-700 hover:text-primary-900 transition-colors"
                  title="Spill av lydopptak"
                >
                  <PiPlayFill className="text-lg" />
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Display name variants and datasets under the title */}
      {(otherLabels.length > 0 || secondaryTitle) && (
        <div className="mt-2 text-sm text-neutral-700">
          {secondaryTitle && <span>{secondaryTitle}</span>}
          {secondaryTitle && otherLabels.length > 0 && <span className="mx-1">|</span>}
          {otherLabels.length > 0 && (
            <span>
              {otherLabels.join(', ')}
            </span>
          )}
        </div>
      )}
    </div>
  }




  return (
    <div ref={resultsContainerRef} className="mb-28 xl:mb-0">
      {
        (point && !init) && (
          <div className="p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button onClick={() => point && mapFunctionRef.current?.flyTo([point[0], point[1]], 15, { duration: 0.25 })}><PiMapPinFill className="text-primary-700" /></button>
              {isEditingCoordinates ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="number"
                    value={editLon}
                    onChange={(e) => setEditLon(e.target.value)}
                    placeholder="Longitude"
                    className="w-20 px-1 py-0.5 text-sm border border-neutral-300 rounded"

                  />
                  <span>,</span>
                  <input
                    type="number"
                    value={editLat}
                    onChange={(e) => setEditLat(e.target.value)}
                    placeholder="Latitude"
                    className="w-20 px-1 py-0.5 text-sm border border-neutral-300 rounded"
                  />


                  <button
                    onClick={saveCoordinates}
                    className="p-1 text-green-600 hover:text-green-800"
                    aria-label="Lagre koordinater"
                  >
                    <PiCheck className="text-lg" aria-hidden="true" />
                  </button>
                  <button
                    onClick={cancelEditingCoordinates}
                    className="p-1 text-red-600 hover:text-red-800"
                    aria-label="Avbryt"
                  >
                    <PiX className="text-lg" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <span className="flex-1">
                  {point ? (
                    <>
                      {`${Math.round(Math.abs(point[0]))}°${point[0] >= 0 ? 'N' : 'S'}, ${Math.round(Math.abs(point[1]))}°${point[1] >= 0 ? 'Ø' : 'V'}`}
                    </>
                  ) : 'Ukjent'}
                </span>
              )}
              <div className="flex items-center gap-2">
                {!isEditingCoordinates && (
                  <ClickableIcon className="btn btn-outline h-6 w-6 btn-compact rounded-full text-neutral-900" label="Rediger startpunkt" onClick={startEditingCoordinates}>
                    <PiPencilSimpleBold />
                  </ClickableIcon>
                )}
                <ClickableIcon className="h-6 w-6 p-0 btn btn-outline rounded-full text-neutral-900" label="Fjern startpunkt" remove={['point', 'radius']}>
                  <PiXBold />
                </ClickableIcon>
              </div>
            </div>
            {isEditingCoordinates && (
              <span className="text-sm text-neutral-800">{isMobile ? "Trykk og hald for å hente startpnk i kartet" : "Høgreklikk for å hente startpunkt i kartet"}</span>
            )}
          </div>
        )
      }
      {init && (initGroupLoading ? (
        <div className="h-14 flex flex-col mx-2 flex-grow justify-center gap-1 divide-y divide-neutral-300">
          <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{ width: `10rem` }}></div>
          <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{ width: `16rem` }}></div>
        </div>
      ) : initGroupData && (
        <div className="relative" key={`init-${initValue}`}>
          <ResultItem
            hit={initGroupData}
          />
          {initGroupData.fields?.["group.id"] ? <>
            <GroupInfo id={`group-info-${initGroupData.fields["group.id"]}`} overrideGroupCode={init || undefined} />

          </>
            : <div className="p-2">Det har oppstått ein feil</div>}
        </div>
      ))}

      {init && !isMobile && (totalHits?.value > initGroupData?.sources?.length) ? (initGroupLoading ? (
        <div className="w-full border-t border-neutral-200 py-2 px-3 flex items-center gap-2">
          <div className="w-4 h-4 bg-neutral-900/10 rounded-full animate-pulse"></div>
          <div className="h-4 bg-neutral-900/10 rounded-full animate-pulse" style={{ width: '10rem' }}></div>
        </div>
      ) : (
        <button
          onClick={() => {
            const nextShow = !showOtherResults
            const newParams = new URLSearchParams(searchParams)
            if (nextShow) {
              const currentAdditional = getAdditionalResultsCount()
              const base = initValue ? 1 : 0
              const desiredAdditional = Math.max(currentAdditional, 1) // at least one extra group
              const newResultsValue = base + desiredAdditional
              const currentResults = resultsParam || base
              newParams.set('results', String(Math.max(currentResults, newResultsValue)))
            } else {
              // Collapse back to only init group
              const base = initValue ? 1 : 0
              newParams.set('results', String(base || 1))
            }
            router.push(`?${newParams.toString()}`)
          }}
          className="w-full text-left border-t border-neutral-200 py-2 px-3 hover:bg-neutral-50 transition-colors flex items-center gap-2 text-neutral-950"
          aria-expanded={showOtherResults}
        >
          {showOtherResults ? <PiMinusBold className="inline self-center text-lg text-primary-700" /> : <PiPlusBold className="inline self-center text-primary-700 text-lg" />}
          <span className="text-lg">Fleire namnegrupper</span>
        </button>
      )) : null}

      {(!init || showOtherResults || isMobile || hasOneResult) && (
        <>
          <SearchQueryDisplay />

          <ul id="result_list" className={`flex flex-col divide-y divide-neutral-300 ${init && !isMobile && showOtherResults ? 'border-b' : 'border-y'} border-neutral-200`}>


            {(initGroupLoading || collapsedLoading && collapsedInitialPage === 1) ? Array.from({ length: collapsedInitialPage === 1 ? 6 : 40 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="h-14 flex flex-col mx-2 flex-grow justify-center gap-1 divide-y divide-neutral-200">
                <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{ width: `${getSkeletonLength(i, 4, 10)}rem` }}></div>
                <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{ width: `${getSkeletonLength(i, 10, 16)}rem` }}></div>
              </div>
            )) :
              collapsedData?.pages.map((page: any, pageIndex: number) => {
                const isLastPage = pageIndex === (collapsedData?.pages.length || 0) - 1
                return (
                  <Fragment key={`page-${pageIndex}`}>
                    {page.data?.map((item: any) => {
                      if (initValue && item.fields["group.id"]?.[0] == initValue) return null;
                      if (!item.fields["group.id"]) {
                        console.log("No group ID", item);
                        return null
                      }
                      return (
                        <CollapsibleResultItem
                          key={item.fields["group.id"]?.[0]}
                          hit={item}
                          activeGroupValue={activeGroupValue}
                        />
                      )
                    })}
                    {/* Vis meir button at the end of each page */}
                    {isLastPage && collapsedHasNextPage && (
                      <li className="flex flex-col gap-2 justify-center py-4">
                        <button
                          type="button"
                          onClick={() => {
                            if (isFetchingNextPage) return

                            const currentAdditional = getAdditionalResultsCount()
                            const base = initValue ? 1 : 0
                            const newAdditional = currentAdditional + SUBSEQUENT_PAGE_SIZE
                            const newResultsValue = base + newAdditional

                            const newParams = new URLSearchParams(searchParams)
                            newParams.set('results', String(newResultsValue))
                            router.push(`?${newParams.toString()}`)

                            collapsedFetchNextPage()
                          }}
                          className={`
                    flex items-center gap-2
                    btn-neutral btn
                    justify-center
                    text-lg

                    px-4 py-2 rounded-full xl:rounded-md
                     mx-3
                    transition-colors
                    ${isFetchingNextPage ? 'opacity-60 pointer-events-none' : ''}
                  `}
                        >
                          {isFetchingNextPage && <Spinner className="text-white" status="Lastar" />} {isFetchingNextPage ? 'Lastar...' : 'Vis fleire'}
                        </button>
                      </li>
                    )}
                  </Fragment>
                )
              })}
          </ul>
        </>
      )}


      {(filterCount > 0 || isMobile || searchError || collapsedError || hasNoResults) && <div className={`flex flex-col gap-4 ${(init && !isMobile && !showOtherResults) ? '' : 'py-4 pb-8 xl:pb-4'}`}>
        {filterCount > 0 && showOtherResults && <div className="mx-2 mb-4">

          <ActiveFilters /></div>}

        {isMobile && (
          <div className="flex flex-col gap-2 justify-center">
            <Clickable
              remove={["results"]}
              add={{ options: 'on' }}
              link
              onClick={() => snappedPosition == 'bottom' ? setSnappedPosition('middle') : null}
              className={`
                  flex items-center gap-2
                  btn-outline btn
                  justify-center
                  text-lg
                  px-4 py-2 rounded-full xl:rounded-md
                  mx-3
                  relative
                `}
            >
              Filtrer søket
            </Clickable>
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
      </div>}
    </div>
  )
}
