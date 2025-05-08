'use client'
import { useDataset } from "@/lib/search-params"
import ClientFacet from "./client-facet"
import { contentSettings } from "@/config/server-config"
import Clickable from "@/components/ui/clickable/clickable"
import { useSearchParams } from "next/navigation"
import ServerFacet from "./server-facet"
import { facetConfig, fieldConfig } from "@/config/search-config"
import { PiCaretDown, PiCaretUp, PiFileX } from "react-icons/pi"
import { GlobalContext } from "@/app/global-provider"
import { useContext } from "react"

export default function FacetSection() {
    const dataset = useDataset()
    const searchParams = useSearchParams()
    const { isMobile } = useContext(GlobalContext)
    const facet = searchParams.get('facet') || 'adm'
    const availableFacets = facetConfig[dataset]
    const nav = searchParams.get('nav')
    return (
        <>
        <div className="flex flex-col divide-y divide-neutral-200">
          {availableFacets.filter(f => f.key != 'adm' || isMobile).map(f => {
            const isExpanded = f.key == 'adm' ? nav == 'adm' : facet == f.key
            return (
            <div key={f.key}>
            <Clickable type="button" 
                       aria-expanded={isExpanded} 
                       className="w-full flex justify-between p-3 aria-expanded:border-b aria-expanded:border-neutral-200"
                       aria-controls={f.key + '-collapsible'} 
                       remove={['facet', 'nav']}
                       add={f.key === 'adm' 
                         ? nav === 'adm' 
                           ? {nav: 'filters'} 
                           : {nav: 'adm', facet: 'adm'}
                         : facet === f.key 
                           ? {nav: 'filters'} 
                           : {nav: 'filters', facet: f.key}}>
              <div className="flex flex-wrap gap-4">
              <span className="text-xl">{f.label}</span>
              {f.key.includes('rawData') ? <em className="text-neutral-700 text-sm self-center">Opphavlege data</em> : null}
              </div>
              {isExpanded ? <PiCaretUp className="inline self-center text-primary-600 text-xl" /> : <PiCaretDown className="inline self-center text-primary-600 text-xl" />}
              
            </Clickable>
            <div id={f.key + '-collapsible'} className={`${isExpanded ? 'block mt-2' : 'hidden'}`}>
              {isExpanded && (f.key == 'adm' ? <ClientFacet facetName={f.key} /> : <ServerFacet/>)}
            </div>
            </div>
          )
        })}
        </div>
        </>
    )
}

    


