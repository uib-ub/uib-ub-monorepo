'use client'
import Spinner from "@/components/svg/Spinner";
import Clickable from "@/components/ui/clickable/clickable";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import { clampMaxResults, expandedMaxResultsParam, getClampedMaxResultsFromParam } from "@/config/max-results";
import { useGroup, usePoint } from "@/lib/param-hooks";
import { base64UrlToString, stringToBase64Url } from "@/lib/param-utils";
import { useSearchQuery } from "@/lib/search-params";
import { getSkeletonLength } from "@/lib/utils";
import useGroupData from "@/state/hooks/group-data";
import useInitData from "@/state/hooks/init-data";
import useResultsData from "@/state/hooks/results-data";
import useSearchData from "@/state/hooks/search-data";
import { GlobalContext } from "@/state/providers/global-provider";
import { useSessionStore } from "@/state/zustand/session-store";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, useContext, useEffect, useMemo, useRef, useState } from "react";
import { PiCaretDownBold, PiCaretRightBold, PiCaretUpBold, PiMagnifyingGlass, PiMapPinFill, PiNut, PiPencilSimpleBold, PiPlayFill, PiQuestion, PiStopFill, PiX, PiXBold } from "react-icons/pi";
import GroupInfo from "../../details/group/group-info";
import { getAlternativeInitLabels } from "../../details/group/group-utils";
import SourceTitle from "../../details/shared/source-title";
import ActiveFilters from "../../form/active-filters";
import ResultItem from "./result-item";
import SearchQueryDisplay from "./search-query-display";
import IconButton from "@/components/ui/icon-button";
import GroupedResultsToggle from "./grouped-results-toggle";
import { GroupFilters } from "../../details/group/names-section";
import { DatasetSummary } from "../../dataset-summary";



const CollapsibleResultItem = ({ hit, activeGroupValue }: { hit: any; activeGroupValue: string | null }) => {  
  const searchParams = useSearchParams()
  const isMobile = useContext(GlobalContext).isMobile
  const init = searchParams.get('init')
  const notClickable = isMobile || !init
  const [expanded, setExpanded] = useState(!searchParams.get('init')) // useState(activeGroupValue == hit.fields['group.id'][0])
  const sourceView = searchParams.get('sourceView') === 'on'
  const groupCode = sourceView ? hit.fields['uuid'][0] : stringToBase64Url(hit.fields['group.id'][0])
  

  return (
    <li className={`relative`} key={hit.fields['group.id'][0]}>
      <ResultItem
        hit={hit}
        notClickable={notClickable}
        {...(!notClickable && { 
          'onClick': () => setExpanded(!expanded),
          'aria-expanded': expanded,
          'aria-controls': `group-info-${hit.fields['group.id'][0]}`
        })}
      />
      {(notClickable || expanded) && (
        <GroupInfo
          id={`group-info-${hit.fields['group.id'][0]}`}
          overrideGroupCode={groupCode}
        />
      )}
    </li>
  )
}


// TODO: implement doc based group info
const DocResultItem = ({ hit }: { hit: any }) => {
  const uuid = hit._source?.uuid ?? hit.uuid
  const distanceMeters = typeof hit.distance === 'number' ? hit.distance : null

  if (!uuid) {
    return null
  }

  return (
    <li className="relative" key={uuid}>
      <GroupInfo
        id={`group-info-${uuid}`}
        overrideGroupCode={uuid}
        docData={hit}
      />
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
  const qParam = searchParams.get('q')?.trim()
  const resultsParam = getClampedMaxResultsFromParam(searchParams.get('maxResults'))
  const sourceView = searchParams.get('sourceView') === 'on'
  const {
    initData,
    initLoading,
    initSearchLabel,
    initGroupData,
    initDocData,
  } = useInitData()
  const { groupData } = useGroupData(group)
  const initValue = init ? base64UrlToString(init) : null
  // In grouped view, init points to a group id (base64 encoded).
  // In non-grouped view, init points to a source uuid, so we must derive the
  // corresponding group id from grouped init data to exclude it from collapsed results.
  const initGroupId = init
    ? (initGroupData?.group?.id ?? (!sourceView ? initValue : null))
    : (!sourceView ? initValue : null)
  const { groupData: activeGroupData } = useGroupData()
  const snappedPosition = useSessionStore((s) => s.snappedPosition)
  const { isMobile, sosiVocab, mapFunctionRef } = useContext(GlobalContext)
  const point = usePoint()
  const { facetFilters, datasetFilters } = useSearchQuery()
  const filterCount = facetFilters.length + datasetFilters.length
  const router = useRouter()
  const identicalQuery = qParam?.toLowerCase() == initSearchLabel?.toLowerCase()
  const coordinateInfo = searchParams.get('coordinateInfo') == 'on' && !sourceView
  const labelFilter = searchParams.get('labelFilter') === 'on'
  const [playingPreviewId, setPlayingPreviewId] = useState<string | null>(null)
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null)
  const searchSort = searchParams.get('searchSort')
  const fuzzy = searchParams.get('fuzzy')
  const fulltext = searchParams.get('fulltext')
  const [searchSettingsExpanded, setSearchSettingsExpanded] = useState( searchSort == 'similarity' || fuzzy == 'on' || fulltext == 'on' )



  useEffect(() => {
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause()
        audioPreviewRef.current = null
      }
    }
  }, [])




  const {
    resultData,
    resultError,
    resultLoading,
    resultFetchNextPage,
    resultHasNextPage,
    resultIsFetchingNextPage,
    resultStatus,
    resultInitialPage,
    resultPageSize,
  } = useResultsData()

  // Helper: count additional groups (excluding init group when present)
  const getAdditionalResultsCount = () => {
    if (!resultData) return 0
    const allHits = resultData.pages.flatMap((page: any) => page.data || [])
    if (sourceView && init) {
      return allHits.filter((hit: any) => (hit._source?.uuid ?? hit.uuid) !== init).length
    }
    if (!initGroupId) return allHits.length
    return allHits.filter((hit: any) => hit.fields?.["group.id"]?.[0] !== initGroupId).length
  }

  // Check if there are no results
  const hasNoResults = resultStatus === 'success' && (!resultData?.pages || resultData.pages.length === 0 || resultData.pages[0].data?.length === 0);
  const hasOneResult = resultStatus === 'success' && resultData?.pages && resultData.pages.length === 1 && resultData.pages[0].data?.length === 1;
  const additionalResultsCount = getAdditionalResultsCount()
  const hasNoAdditionalResults =
    resultStatus === 'success' &&
    !!init &&
    !coordinateInfo &&
    !labelFilter &&
    additionalResultsCount === 0
  const alternativeInitLabels = useMemo(() => {
    if (!hasNoAdditionalResults) return []
    return getAlternativeInitLabels({
      sourceView,
      initDocData,
      initGroupData,
      currentQuery: qParam,
      initSearchLabel,
      maxLabels: 8,
    })
  }, [hasNoAdditionalResults, initDocData, initGroupData, initSearchLabel, qParam, sourceView])
  const hasMaxResultsLimit = resultsParam > 0
  const initVisibleCount = sourceView ? (init ? 1 : 0) : (initGroupId ? 1 : 0)
  const maxAdditionalVisible = hasMaxResultsLimit
    ? Math.max(resultsParam - initVisibleCount, 0)
    : Number.POSITIVE_INFINITY;

  // Derived: should "Fleire namnegrupper" and the list of other groups be visible?
  // For init on desktop, this is controlled solely by resultsParam (>1 means expanded).
  const showOtherResults = (!init || isMobile || hasOneResult)
    ? true
    : (resultsParam > 1);


  // On mobile, show a compact summary for the "init" group when pinned,
  // otherwise fall back to the currently active group.
  if (isMobile && snappedPosition == 'bottom' && !coordinateInfo && !labelFilter && (init || activeGroupValue)) {

    const summaryGroupData = init ? initGroupData : activeGroupData
    if (!summaryGroupData) return null;

    const label = summaryGroupData?.fields?.label?.[0]
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
      (summaryGroupData?.sources || [])
        .flatMap((src: any) => {
          if (!src.sosi) return []
          return Array.isArray(src.sosi) ? src.sosi : [src.sosi]
        })
        .filter((sosi: string) => sosi)
    )) as string[]
    const sosiTypes = sosiTypesRaw.map((type: string) => sosiVocab[type]?.label || type)

    summaryGroupData?.sources?.forEach((source: any) => {
      if (!seenDatasets.has(source.dataset)) {
        datasets.push(source.dataset)
        seenDatasets.add(source.dataset)
      }
      if (source.recordings) {
        audioItems.push(source)
      }
    })

    const handlePlayAudio = (recording: any) => {
      // Toggle pause if the same recording is already playing
      if (audioPreviewRef.current && playingPreviewId === recording.uuid) {
        if (!audioPreviewRef.current.paused) {
          audioPreviewRef.current.pause()
          setPlayingPreviewId(null)
          return
        }
      }

      // Stop any previous preview
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause()
        audioPreviewRef.current = null
      }

      const audio = new Audio(`https://iiif.spraksamlingane.no/iiif/audio/hord/${recording.file}`)
      audioPreviewRef.current = audio
      setPlayingPreviewId(recording.uuid)

      audio.addEventListener('ended', () => {
        setPlayingPreviewId((current) => (current === recording.uuid ? null : current))
      })

      audio.play().catch((error) => {
        // Ignore AbortError caused by a pause() interrupting play()
        if ((error as any)?.name === 'AbortError') {
          return
        }
        console.error(error)
        setPlayingPreviewId((current) => (current === recording.uuid ? null : current))
      })
    }

    return <div className="px-2 h-[100vh]">
      <div className="flex items-center gap-2">
        <SourceTitle
          label={label}
          sosiTypes={sosiTypes}
          sosiLimit={3}
          className="min-w-0 flex-1"
          labelClassName="text-xl truncate"
          sosiClassName="truncate"
        />
        {audioItems.length > 0 && (
          <div className="flex gap-1 ml-auto flex-shrink-0 border border-neutral-200 rounded-md p-1 mr-2">
            {audioItems.map((audioItem, index: number) =>
              audioItem.recordings.map((recording: any) => (
                <button
                  key={"audio-preview-" + recording.uuid}
                  onClick={() => handlePlayAudio(recording)}
                  className={`p-1 rounded-md text-neutral-900`}
                  aria-label={`Lydopptak${audioItems.length > 1 ? ` ${index + 1} av ${audioItems.length}` : ''}${playingPreviewId === recording.uuid ? ' (stoppar)' : ''}`}
                  aria-pressed={playingPreviewId === recording.uuid}
                >
                  {playingPreviewId === recording.uuid ? <PiStopFill className="text-lg" aria-hidden="true" /> : <PiPlayFill className="text-lg" aria-hidden="true" />}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Display name variants and datasets under the title */}
      {(otherLabels.length > 0 || datasets.length > 0) && (
        <div className="mt-2 text-sm text-neutral-700">
          {datasets.length > 0 && (
            <DatasetSummary datasetKeys={datasets} />
          )}
          {datasets.length > 0 && otherLabels.length > 0 && <span className="mx-1">|</span>}
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
        (point && !init) && !coordinateInfo && !labelFilter && (
          <div className="p-3 flex flex-col gap-2">
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
              <div className="flex items-center ml-auto">
                <ClickableIcon className="h-6 w-6 p-0 btn btn-outline rounded-full text-neutral-900" label="Fjern startpunkt" remove={['point', 'radius']}>
                  <PiXBold aria-hidden="true" />
                </ClickableIcon>
              </div>
              
              
            </div>

              
          </div>
        )
      }
      {
        group && sourceView && groupData && (
          <GroupFilters />
        )
      }
      {init && !coordinateInfo && !labelFilter && (initLoading ? (
        <div className="h-14 flex flex-col mx-2 flex-grow justify-center gap-1 divide-y divide-neutral-300">
          <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{ width: `10rem` }}></div>
          <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{ width: `16rem` }}></div>
        </div>
      ) : initData && (
        <div className="relative" key={`init-${initValue}`}>
          {sourceView ? (
            <GroupInfo id={`group-info-${init}`} overrideGroupCode={init || undefined} docData={initDocData} />
          ) : (
            <>
              <ResultItem hit={initGroupData} notClickable={true} />
              {initGroupData.fields?.['group.id'] ? (
                <GroupInfo id={`group-info-${initGroupData.fields['group.id']}`} overrideGroupCode={init || undefined} />
              ) : null}
            </>
          )}
        </div>
      ))}

      {(coordinateInfo || labelFilter) && (
        <GroupInfo id={`group-info-${activeGroupValue}`} overrideGroupCode={activeGroupValue || undefined} />
      )}

      {(init || (isMobile && qParam)) && !coordinateInfo && !labelFilter ? (initLoading ? (
        <div className="w-full border-t border-neutral-200 py-2 px-3 flex items-center gap-2">
          <div className="w-4 h-4 bg-neutral-900/10 rounded-full animate-pulse"></div>
          <div className="h-4 bg-neutral-900/10 rounded-full animate-pulse" style={{ width: '10rem' }}></div>
        </div>
      ) : (
        <div className="w-full border-t border-neutral-200 bg-neutral-50 border-b-none pt-4 pb-2 xl:py-2 px-3 flex flex-col gap-2 text-neutral-950 min-w-0 overflow-hidden">
          
          <div className="flex items-center gap-2">
          {qParam ? <>
            
            
            <Clickable
              remove={['q', 'searchSort']}
              add={{ q: null }}
              onClick={() => setSearchSettingsExpanded(false)}
              className="px-3 py-1.5 rounded-md bg-white border border-neutral-200 flex items-center gap-2 cursor-pointer max-w-full min-w-0"
            >
              <PiMagnifyingGlass className="" aria-hidden="true" />
              <span
                className="truncate flex-1 min-w-0 max-w-full block"
                title={String(qParam)}
              >
                {qParam}
              </span>
              <PiX className="text-lg" aria-hidden="true" />
            </Clickable>
          
          
          <button aria-expanded={searchSettingsExpanded} aria-controls="search-settings"   type="button" className="flex items-center gap-1 justify-center ml-auto" onClick={() => setSearchSettingsExpanded(!searchSettingsExpanded)}>
            {searchSettingsExpanded ? <PiCaretUpBold className="text-lg" aria-hidden="true" /> : <PiCaretDownBold className="text-lg" aria-hidden="true" />}
            Søkealternativ            
            </button>
            </>
            : 
            <>
            <span id="other-groups-title" className={`text-lg font-sans text-neutral-900 whitespace-nowrap`}>{sourceView ? 'Fleire kjeldeoppslag' : 'Fleire namnegrupper'}</span>
            
            <Clickable add={{ q: initSearchLabel}}
                className="ml-auto px-3 py-1.5 rounded-md bg-white border border-neutral-200 flex items-center gap-1 cursor-pointer no-underline max-w-full min-w-0"
              >
                {!(qParam && !identicalQuery) &&<PiMagnifyingGlass aria-hidden="true" className="flex-shrink-0" />}
                <span className="ml-1 truncate flex-1 min-w-0">
                  {initSearchLabel}
                </span>
                {qParam && !identicalQuery && <PiCaretRightBold aria-hidden="true" className="flex-shrink-0" />}
              </Clickable>
            </>
            }</div>

          
        </div>
         
      )) : null}
      
     

      {(!init || showOtherResults || isMobile || hasOneResult) && (!coordinateInfo && !labelFilter) && (
        <>
          {(searchSettingsExpanded || !init) && <SearchQueryDisplay />}

          {!hasNoAdditionalResults && (
            <ul id="result_list" aria-labelledby="other-groups-title" className={`flex flex-col divide-y divide-neutral-300 ${init && !isMobile && showOtherResults ? 'border-b' : 'border-y'} border-neutral-200`}>


            {(initLoading || resultLoading && resultInitialPage === 1) ? Array.from({ length: resultInitialPage === 1 ? 6 : 40 }).map((_, i) => (
              <div key={`skeleton-${i}`} className="h-14 flex flex-col mx-2 flex-grow justify-center gap-1 divide-y divide-neutral-200">
                <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{ width: `${getSkeletonLength(i, 4, 10)}rem` }}></div>
                <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{ width: `${getSkeletonLength(i, 10, 16)}rem` }}></div>
              </div>
            )) :
              (() => {
                let renderedAdditional = 0
                return resultData?.pages.map((page: any, pageIndex: number) => {
                const isLastPage = pageIndex === (resultData?.pages.length || 0) - 1




                return (
                  <Fragment key={`page-${pageIndex}`}>
                    {page.data?.map((item: any) => {
                      if (sourceView) {
                        const itemUuid = item._source?.uuid ?? item.uuid
                        if (init && itemUuid === init) return null
                        if (renderedAdditional >= maxAdditionalVisible) return null
                        if (!itemUuid) return null
                        renderedAdditional += 1
                        return <DocResultItem key={itemUuid} hit={item} />
                      }
                      if (initGroupId && item.fields["group.id"]?.[0] == initGroupId) return null;
                      if (renderedAdditional >= maxAdditionalVisible) return null;
                      if (!item.fields["group.id"]) {
                        console.log("No group ID", item);
                        return null
                      }
                      renderedAdditional += 1
                      return (
                        <CollapsibleResultItem
                          key={item.fields["group.id"]?.[0]}
                          hit={item}
                          activeGroupValue={activeGroupValue}
                        />
                      )
                    })}
                    {/* Vis meir button at the end of each page */}
                    {isLastPage && resultHasNextPage && (
                      <li className="flex flex-col gap-2 justify-center py-4">
                        <Clickable
                          onClick={() => {
                            if (resultIsFetchingNextPage) return

                            const currentAdditional = getAdditionalResultsCount()
                            const base = initVisibleCount
                            const newAdditional = currentAdditional + resultPageSize
                            const newResultsValue = clampMaxResults(base + newAdditional)

                            const newParams = new URLSearchParams(searchParams)
                            newParams.set('maxResults', String(newResultsValue))
                            router.push(`?${newParams.toString()}`, { scroll: false })

                            resultFetchNextPage()
                          }}
                          className={`
                    flex items-center gap-2
                    btn-neutral btn
                    justify-center
                    text-lg

                    px-4 py-2 rounded-full xl:rounded-md
                     mx-3
                    transition-colors
                    ${resultIsFetchingNextPage ? 'opacity-60 pointer-events-none' : ''}
                  `}
                        >
                          {resultIsFetchingNextPage && <Spinner className="text-white" status="Lastar" />} {resultIsFetchingNextPage ? 'Lastar...' : 'Vis meir'}
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


      {(isMobile || searchError || resultError || hasNoResults || hasNoAdditionalResults) && (!labelFilter) && <div className={`flex flex-col gap-4 ${(init && !isMobile && !showOtherResults) ? '' : 'py-4 pb-8 xl:pb-4'}`}>
        {filterCount > 0 && showOtherResults && <div className="mx-2 mb-4">

          <ActiveFilters /></div>}



        {/* Error and empty states */}
        {searchError || resultError ? (
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
              {alternativeInitLabels.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 max-w-full">
                  {alternativeInitLabels.map((label) => (
                    <Clickable
                      key={`alternative-label-${label}`}
                      add={{ q: label }}
                      remove={['searchSort']}
                      onClick={() => setSearchSettingsExpanded(false)}
                      className="px-3 py-1.5 rounded-md bg-white border border-neutral-200 flex items-center gap-2 cursor-pointer max-w-full min-w-0"
                    >
                      <PiMagnifyingGlass aria-hidden="true" />
                      <span className="truncate max-w-[16rem]" title={label}>
                        {label}
                      </span>
                    </Clickable>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>}
    </div>
  )
}
