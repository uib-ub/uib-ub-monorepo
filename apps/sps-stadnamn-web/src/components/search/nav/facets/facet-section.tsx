'use client'
import { usePerspective } from "@/lib/search-params"
import ClientFacet from "./client-facet"
import Clickable from "@/components/ui/clickable/clickable"
import { useSearchParams } from "next/navigation"
import ServerFacet from "./server-facet"
import { facetConfig } from "@/config/search-config"
import { PiCaretDownBold, PiCaretUpBold } from "react-icons/pi"
import { GlobalContext } from "@/app/global-provider"
import { useContext } from "react"
import { datasetTitles } from "@/config/metadata-config"
import WikiAdmFacet from "./wikiAdm-facet"

export default function FacetSection() {
    const perspective = usePerspective()
    const searchParams = useSearchParams()
    const facet = searchParams.get('facet')
    const indexDatasets = searchParams.getAll('indexDataset')
    const filterDataset = perspective == 'all' ? indexDatasets.length == 1 ? indexDatasets[0] : 'all' : perspective
    
    const availableFacets = filterDataset == 'all'
        ? facetConfig['all'].filter(f => indexDatasets.length > 0 ? f.datasets?.find((d: string) => indexDatasets.includes(d)) : f.key == 'indexDataset' || (f.datasets?.length && f.datasets?.length > 1)).sort((a, b) => (a.key === 'indexDataset' ? -1 : b.key === 'indexDataset' ? 1 : (b?.datasets?.length || 0) - (a?.datasets?.length || 0)))
        : facetConfig[filterDataset];
    const nav = searchParams.get('nav')



    return (
        <>
        <div className="flex flex-col divide-y divide-neutral-200">
          {availableFacets.filter(f => !f.child && f.key != 'indexDataset').map(f => {
            const isExpanded = facet == f.key
            return (
            <div key={f.key}>
            <Clickable type="button" 
                       aria-expanded={isExpanded} 
                       className="w-full flex justify-between p-3 aria-expanded:border-b aria-expanded:border-neutral-200"
                       aria-controls={f.key + '-collapsible'} 
                       add={{facet: isExpanded ? null : f.key}}>
              <div className="flex flex-wrap gap-4">
              <span className="text-xl">{f.label}</span>
              {filterDataset == 'all' && (f.datasets?.length || 0) > 1 && <em className="text-neutral-700 text-sm self-center">{f.datasets?.length} datasett</em>}
              {filterDataset == 'all' && (f.datasets?.length || 0) == 1 && f.datasets?.[0] && <em className="text-neutral-700 text-sm self-center">{datasetTitles[f.datasets?.[0]]}</em>}
              {filterDataset != 'all' && f.key.includes('rawData') ? <em className="text-neutral-700 text-sm self-center">Opphavlege data</em> : null}
              </div>
              {isExpanded ? <PiCaretUpBold className="inline self-center text-primary-600 text-xl" /> : <PiCaretDownBold className="inline self-center text-primary-600 text-xl" />}
              
            </Clickable>
            <div id={f.key + '-collapsible'} className={`${isExpanded ? 'block mt-2' : 'hidden'}`}>
              {isExpanded && (f.key == 'adm' ? <ClientFacet facetName={f.key} /> : f.key == 'wikiAdm' ? <WikiAdmFacet /> : <ServerFacet/>)}
            </div>
            </div>
          )
        })}
        </div>
        </>
    )
}

    


