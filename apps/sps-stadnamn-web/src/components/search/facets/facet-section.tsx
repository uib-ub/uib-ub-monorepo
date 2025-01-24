'use client'
import { useDataset } from "@/lib/search-params"
import ClientFacet from "./client-facet"
import { contentSettings } from "@/config/server-config"
import Clickable from "@/components/ui/clickable/clickable"
import { useSearchParams } from "next/navigation"
import ServerFacet from "./server-facet"
import { useState } from "react"
import { facetConfig } from "@/config/search-config"


export default function Facets() {
    const dataset = useDataset()
    const searchParams = useSearchParams()
    const facet = searchParams.get('facet') || 'adm'

    const [loadingFacet, setLoadingFacet] = useState<string | null>(null)

    const availableFacets = facetConfig[dataset]


      return (
        <>
        <div role="tablist" className="flex flex-wrap items-center gap-1">
        { contentSettings[dataset]?.adm && <>
          <h3>
          <Clickable type="button" role="tab" aria-selected={facet == 'adm'} remove={['facet']} className='rounded-tabs'>
          
          Område
          
          </Clickable>
          </h3>

          {availableFacets.filter(f => f.featuredFacet).map(f => 
            <h3 key={f.key}>
              <Clickable type="button" role="tab" aria-selected={facet == f.key} add={{facet: f.key}} className='rounded-tabs'>
                {f.label}
              </Clickable>
            </h3>
          )}


          <h3>
          <Clickable type="button" role="tab" aria-selected={facet != 'adm' && !fieldConfig[dataset][facet].featuredFacet} add={{facet: availableFacets.find(f => !f.featuredFacet)?.key || null}} className='rounded-tabs'>
          
          Meir
          
          </Clickable>
          </h3>
          </>
          
        }
        </div>
        { (!facet || facet == 'adm') ? <ClientFacet facetName='adm' /> : 
         <ServerFacet/> }
        </>
      )
  }

    


