'use client'
import { useSearchQuery } from "@/lib/search-params"
import ClientFacet from "./client-facet"
import Clickable from "@/components/ui/clickable/clickable"
import { useSearchParams } from "next/navigation"
import ServerFacet from "./server-facet"
import { facetConfig } from "@/config/search-config"
import { PiCaretDownBold, PiCaretRightBold, PiCaretUpBold, PiFunnel, PiMagnifyingGlass, PiMapPinArea, PiMapPinAreaFill, PiMapPinFill } from "react-icons/pi"
import { useContext, useEffect, useState } from "react"
import { datasetTitles } from "@/config/metadata-config"
import WikiAdmFacet from "./wikiAdm-facet"
import { getSkeletonLength } from "@/lib/utils"
import { usePerspective } from "@/lib/param-hooks"
import DatasetFacet from "./dataset-facet"
import MiscOptions from "@/app/misc-options"
import { GlobalContext } from "@/state/providers/global-provider"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useSessionStore } from "@/state/zustand/session-store"
import { useGroup } from "@/lib/param-hooks"
import useGroupData from "@/state/hooks/group-data"

const getFacetFieldCounts = async (searchQueryString: string) => {
  const response = await fetch(`/api/fieldsPresent?${searchQueryString}`)
  const es_data = await response.json()

  return es_data.aggregations?.fields_present?.buckets

}

const RadiusFilter = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { activeGroupCode } = useGroup()
  const { groupData } = useGroupData()
  const displayRadius = useSessionStore((s) => s.displayRadius)
  const setDisplayRadius = useSessionStore((s) => s.setDisplayRadius)
  const setDisplayPoint = useSessionStore((s) => s.setDisplayPoint)
  const displayPoint = useSessionStore((s) => s.displayPoint)
  const submittedRadius = searchParams.get('radius')
  const point = searchParams.get('point') ? (searchParams.get('point')!.split(',').map(parseFloat) as [number, number]) : null

  // Get the current location (either from point or group)
  const currentLocation = point || (groupData?.sources?.find((source: any) => source.location?.coordinates)?.location?.coordinates ? 
    [groupData.sources.find((source: any) => source.location?.coordinates).location.coordinates[1], 
     groupData.sources.find((source: any) => source.location?.coordinates).location.coordinates[0]] as [number, number] : 
    null)

  if (!currentLocation) return null

  const handleRadiusChange = (value: string) => {
    setDisplayRadius(value ? parseInt(value) : null)
    setDisplayPoint(point || (groupData?.fields?.location?.[0]?.coordinates ? [groupData.fields.location[0].coordinates[1], groupData.fields.location[0].coordinates[0]] as [number, number] : null))
  }


  const formatRadius = (radiusValue: number) => {
    if (radiusValue >= 1000) {
      return `${(radiusValue / 1000).toLocaleString('no-NO', { maximumFractionDigits: 2 })} km`
    } else {
      return `${radiusValue} m`
    }
  }
    

  const currentRadiusValue = displayRadius || submittedRadius || 1000
  

  return (
    <div className="px-4 py-3 border-b border-neutral-200">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium">
          Avstand frå gjeldande punkt
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <input
            name="radius"
            type="range"
            min="10"
            max="10000"
            step="10"
            value={currentRadiusValue}
            onChange={e => handleRadiusChange(e.target.value)}
            className="accent-primary-700 w-full"
            aria-label="Radius for søk"
          />
        </div>
        <span className="text-sm min-w-0 flex-shrink-0">
          {formatRadius(Number(currentRadiusValue))}
        </span>
      </div>

      <div className="flex gap-2 mt-3">
        {/* Bruk radius */}
        {!submittedRadius && (
          <Clickable
            add={{ radius: displayRadius }}
            onClick={() => {
              setDisplayRadius(null);
              setDisplayPoint(null);
            }}
            className="btn btn-outline"
          >
            Bruk
          </Clickable>
        )}

        {/* Oppdater */}
        {(displayRadius && submittedRadius && displayRadius !== Number(submittedRadius)) && (
          <Clickable
            add={{ radius: displayRadius }}
            className="btn btn-outline"
            onClick={() => {
              setDisplayRadius(null);
              setDisplayPoint(null);
            }}
          >
            Oppdater
          </Clickable>
        )}

        {/* Fjern radius */}
        {submittedRadius && (
          <Clickable
            remove={["radius", ...activeGroupCode ? ["point"] : []]}
            className="btn btn-outline"
          >
            Fjern radius
          </Clickable>
        )}

        {/* Avbryt */}
        {(displayRadius || displayPoint) && (
          <button
            type="button"
            onClick={() => {
              setDisplayRadius(null);
              setDisplayPoint(null);
            }}
            className="btn-outline btn"
          >
            Avbryt
          </button>
        )}
      </div>
    </div>
  )
}

export default function FacetSection() {
    const perspective = usePerspective()
    const searchParams = useSearchParams()
    const facet = searchParams.get('facet')
    const datasets = searchParams.getAll('dataset')
    const filterDataset = perspective == 'all' ? datasets.length == 1 ? datasets[0] : 'all' : perspective
    const { facetFilters } = useSearchQuery()

    const { isMobile } = useContext(GlobalContext)
    /*
    
    const availableFacets = filterDataset == 'all'
        ? facetConfig['all'].filter(f => datasets.length > 0 ? f.datasets?.find((d: string) => datasets.includes(d)) : f.key == 'dataset' || (f.datasets?.length && f.datasets?.length > 1)).sort((a, b) => (a.key === 'dataset' ? -1 : b.key === 'dataset' ? 1 : (b?.datasets?.length || 0) - (a?.datasets?.length || 0)))
        : facetConfig[filterDataset];
      */
  
    const { searchQueryString } = useSearchQuery()

    const { data: facetFieldCounts, isLoading: facetsLoading } = useQuery({
      queryKey: ['facetFieldCounts', searchQueryString],
      queryFn: () => getFacetFieldCounts(searchQueryString)
    })




    const availableFacets = filterDataset == 'all'
        ? facetConfig['all'].filter(f => {
            // Check if this facet field has count > 0 OR is currently being filtered
            if (f.specialFacet) return true;
            const fieldName = f.key + ((f.type || f.keyword) ? '' : '.keyword');
            const hasCount = facetFieldCounts?.[f.key]?.doc_count > 0 || facetFieldCounts?.[fieldName]?.doc_count > 0;
            const isFiltered = facetFilters.some(([key]) => key === f.key);
            return hasCount || isFiltered;
        }).filter(f => datasets.length > 0 ? f.datasets?.find((d: string) => datasets.includes(d)) : f.key == 'dataset' || (f.datasets?.length && f.datasets?.length > 1))
        : 
        facetConfig[filterDataset]?.filter(f => {
            if (f.specialFacet) return true;
            const fieldName = f.key + ((f.type || f.keyword) ? '' : '.keyword');
            const hasCount = facetFieldCounts?.[f.key]?.doc_count > 0 || facetFieldCounts?.[fieldName]?.doc_count > 0;
            const isFiltered = facetFilters.some(([key]) => key === f.key);
            return hasCount || isFiltered;
        });


    return (
        
        
        <div className="flex flex-col divide-y divide-neutral-200 border-b border-neutral-200 w-full pb-20">
           <MiscOptions/>

          {false && <RadiusFilter />}
          <Clickable 
                       className="w-full flex justify-between p-3"
                       add={{facet: facet == 'dataset' ? null : 'dataset'}}>
            
              <span className="text-lg">Datasett</span>
              <PiCaretRightBold className="inline self-center text-primary-700 text-xl" />
           
          </Clickable>


          {(facetsLoading && !availableFacets.length) && (
            <>
              {Array.from({length: 3}).map((_, index) => (
                <div key={index}>
                  <div className="w-full flex justify-between p-3">
                    <div className="flex flex-wrap gap-4">
                      <div 
                        style={{width: getSkeletonLength(index, 8, 14) + 'rem'}} 
                        className="h-6 bg-neutral-900/10 rounded-full animate-pulse"
                      ></div>
                    </div>
                    <div className="w-5 h-5 bg-neutral-900/10 rounded-full animate-pulse self-center"></div>
                  </div>
                </div>
              ))}
            </>
          )}

          { availableFacets.filter(f => !f.child && f.key != 'dataset').map(f => {
            const isExpanded = facet == f.key
            return (
            <div key={f.key} className={facetsLoading ? 'opacity-50' : ''}>
            <Clickable className="w-full flex justify-between p-3"
                       aria-controls={f.key + '-collapsible'} 
                       add={{facet: f.key}}>
              <div className="flex flex-wrap gap-4">
              <span className="text-lg">{f.label}</span>

              {filterDataset == 'all' && (f.datasets?.length || 0) == 1 && f.datasets?.[0] && <em className="text-neutral-700 text-sm self-center">{datasetTitles[f.datasets?.[0]]}</em>}
              {filterDataset != 'all' && f.key.includes('rawData') ? <em className="text-neutral-700 text-sm self-center">Opphavlege data</em> : null}
              </div>
              <PiCaretRightBold className="inline self-center text-primary-700 text-xl" />
              
              
            </Clickable>

            </div>
          )
        })}
        </div>
        
    )
}

    


