'use client'
import { Fragment, useContext, useRef, useState } from "react"
import ResultItem from "./result-item";
import { getSkeletonLength } from "@/lib/utils";
import useCollapsedData from "@/state/hooks/collapsed-data";
import useSearchData from "@/state/hooks/search-data";
import GroupInfo from "../../details/group/group-info";
import { base64UrlToString, stringToBase64Url } from "@/lib/param-utils";
import { useSearchParams } from "next/navigation";
import { useGroup } from "@/lib/param-hooks";
import { PiMapPinFill, PiPlusBold, PiXCircle, PiPencilSimple, PiCheck, PiX, PiPlayFill, PiTilde, PiMagnifyingGlass } from "react-icons/pi";
import useGroupData from "@/state/hooks/group-data";
import Spinner from "@/components/svg/Spinner";
import { useSessionStore } from "@/state/zustand/session-store";
import { GlobalContext } from "@/state/providers/global-provider";
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import { datasetTitles } from "@/config/metadata-config";
import Clickable from "@/components/ui/clickable/clickable";
import SearchSuggestions from "./search-suggestions";



const CollapsibleResultItem = ({hit, activeGroupValue}: {hit: any, activeGroupValue: string | null}) => {
  const [expanded, setExpanded] = useState(activeGroupValue == hit.fields["group.id"][0])
  const groupCode = stringToBase64Url(hit.fields["group.id"][0])
  return (
    <li className="relative" key={hit.fields["group.id"][0]}>
      <ResultItem hit={hit} onClick={() => setExpanded(!expanded)} aria-controls={`group-info-${hit.fields["group.id"][0]}`} aria-expanded={expanded}/>
      {expanded && <GroupInfo id={`group-info-${hit.fields["group.id"][0]}`} overrideGroupCode={groupCode}/>}
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
  const { groupData: activeGroupData } = useGroupData()
  const snappedPosition = useSessionStore((s) => s.snappedPosition)
  const { isMobile, sosiVocab } = useContext(GlobalContext)
  const point = searchParams.get('point') ? (searchParams.get('point')!.split(',').map(parseFloat) as [number, number]) : null
  
  // State for inline coordinate editing
  const [isEditingCoordinates, setIsEditingCoordinates] = useState(false)
  const [editLat, setEditLat] = useState('')
  const [editLon, setEditLon] = useState('')
  
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
    setIsEditingCoordinates(false)
    setEditLat('')
    setEditLon('')
  }
  
  const saveCoordinates = () => {
    const lat = parseFloat(editLat)
    const lon = parseFloat(editLon)
    
    if (!isNaN(lat) && !isNaN(lon)) {
      // Update URL with new coordinates
      const newParams = new URLSearchParams(searchParams)
      newParams.set('point', `${lon},${lat}`)
      window.history.pushState({}, '', `${window.location.pathname}?${newParams.toString()}`)
      setIsEditingCoordinates(false)
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



  // Check if there are no results
  const hasNoResults = collapsedStatus === 'success' && (!collapsedData?.pages || collapsedData.pages.length === 0 || collapsedData.pages[0].data?.length === 0);


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
      const audio = new Audio(`https://iiif.test.ubbe.no/iiif/audio/hord/${recording.file}`)
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
          <div className="p-3 flex items-center gap-2">
            <PiMapPinFill className="text-primary-700" />
            <span>
              {"Startpunkt: "}
              {isEditingCoordinates ? (
                <div className="inline-flex items-center gap-2">
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
                    title="Lagre koordinater"
                  >
                    <PiCheck className="text-lg" />
                  </button>
                  <button
                    onClick={cancelEditingCoordinates}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Avbryt"
                  >
                    <PiX className="text-lg" />
                  </button>
                </div>
              ) : (
                <strong className="select">
                  {point ? 
                    point.map(coord => coord.toFixed(5)).join(', ') :
                    (() => {
                      const sourceWithLocation = activeGroupData?.sources?.find((source: any) => source.location?.coordinates)
                      if (sourceWithLocation?.location?.coordinates) {
                        const [lon, lat] = sourceWithLocation.location.coordinates
                        return `${lat.toFixed(5)}, ${lon.toFixed(5)}`
                      }
                      return 'Ukjent lokasjon'
                    })()
                  }
                </strong>
              )}
            </span>
            <div className="ml-auto flex items-center gap-1">
              {!isEditingCoordinates && (
                <button
                  onClick={startEditingCoordinates}
                  className="p-1 text-neutral-700 hover:text-neutral-800"
                  title="Rediger koordinater"
                >
                  <PiPencilSimple className="text-lg" />
                </button>
              )}
              <ClickableIcon label="Fjern startpunkt" remove={['point', 'radius']}><PiXCircle className="text-neutral-700 group-aria-expanded:text-white text-2xl" /></ClickableIcon>
            </div>
          </div>
        )
      }
      {init && (initGroupLoading ? (
        <div className="h-14 flex flex-col mx-2 flex-grow justify-center gap-1 divide-y divide-neutral-300">
          <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{width: `10rem`}}></div>
          <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{width: `16rem`}}></div>
        </div>
      ) : initGroupData && (
        <li className="relative" key={`init-${initValue}`}>
          <ResultItem 
            hit={initGroupData}
          />
          { initGroupData.fields?.["group.id"] ?
         <GroupInfo id={`group-info-${initGroupData.fields["group.id"]}`} overrideGroupCode={init || undefined}/>
         : <div className="p-2">Det har oppstått ein feil</div>}
        </li>
      ))}

      <ul id="result_list" className='flex flex-col mb-8 xl:mb-0 divide-y divide-neutral-300 border-y border-neutral-200'>
      

      {(initGroupLoading || collapsedLoading && collapsedInitialPage === 1) ? Array.from({ length: collapsedInitialPage === 1 ? 6 : 40 }).map((_, i) => (
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
        <div className="flex flex-col gap-2 justify-center mt-4">
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
               mx-3
              transition-colors
              ${isFetchingNextPage ? 'opacity-60 pointer-events-none' : ''}
            `}
          >
            {isFetchingNextPage && <Spinner status="Lastar" />} {isFetchingNextPage ? 'Lastar...' : 'Vis fleire'}
          </button>
          

        </div>
      )}
      <SearchSuggestions initGroupData={initGroupData} />
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
