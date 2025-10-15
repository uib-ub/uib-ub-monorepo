'use client'
import { useSearchQuery } from "@/lib/search-params"
import ClientFacet from "./client-facet"
import Clickable from "@/components/ui/clickable/clickable"
import { useSearchParams } from "next/navigation"
import ServerFacet from "./server-facet"
import { facetConfig } from "@/config/search-config"
import { PiCaretDownBold, PiCaretRightBold, PiCaretUpBold, PiFunnel, PiMagnifyingGlass } from "react-icons/pi"
import { useContext, useEffect, useState } from "react"
import { datasetTitles } from "@/config/metadata-config"
import WikiAdmFacet from "./wikiAdm-facet"
import { getSkeletonLength } from "@/lib/utils"
import { usePerspective } from "@/lib/param-hooks"
import DatasetFacet from "./dataset-facet"
import MiscOptions from "@/app/misc-options"
import { GlobalContext } from "@/state/providers/global-provider"
import { useQuery } from "@tanstack/react-query"

const getFacetFieldCounts = async (searchQueryString: string) => {
  const response = await fetch(`/api/fieldsPresent?${searchQueryString}`)
  const es_data = await response.json()

  return es_data.aggregations?.fields_present?.buckets

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
        
        
        <div className="flex flex-col divide-y divide-neutral-200 border-b border-neutral-200 w-full pb-10">
          <div className="flex flex-col gap-2 px-4">
           <MiscOptions/>
           </div>
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

    


