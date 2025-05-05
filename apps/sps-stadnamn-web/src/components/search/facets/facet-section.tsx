'use client'
import { useDataset } from "@/lib/search-params"
import ClientFacet from "./client-facet"
import { contentSettings } from "@/config/server-config"
import Clickable from "@/components/ui/clickable/clickable"
import { useSearchParams } from "next/navigation"
import ServerFacet from "./server-facet"
import { facetConfig, fieldConfig } from "@/config/search-config"
import { PiCaretDown, PiCaretUp } from "react-icons/pi"


export default function Facets() {
    const dataset = useDataset()
    const searchParams = useSearchParams()
    const facet = searchParams.get('facet') || 'adm'
    const availableFacets = facetConfig[dataset]


      return (
        <>
        <div className="flex flex-col divide-y divide-neutral-300">
          {availableFacets.map(f => 
            <div key={f.key}>
            <Clickable type="button" 
                       aria-expanded={facet == f.key} 
                       className="w-full flex justify-between p-2 my-1 rounded-md aria-expanded:bg-neutral-50 aria-expanded:shadow-inner"
                       aria-controls={f.key + '-collapsible'} 
                       remove={['facet']}
                       add={f.key !== facet ? {facet: f.key} : {}}>
              {f.label}
              {facet == f.key ? <PiCaretUp className="inline self-center text-primary-600" /> : <PiCaretDown className="inline self-center text-primary-600" />}
            </Clickable>
            <div id={f.key + '-collapsible'} className={`${facet == f.key ? 'block mt-2' : 'hidden'}`}>
              <ServerFacet/>
            </div>
            </div>
          )}

        </div>

        </>
      )
  }

    


