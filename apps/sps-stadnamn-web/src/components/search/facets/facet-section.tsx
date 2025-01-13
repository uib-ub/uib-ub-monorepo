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


      return (
        <>
        <div role="tablist" className="flex flex-wrap items-center gap-1">
        { contentSettings[dataset]?.adm && <>
          <h3>
          <Clickable type="button" role="tab" aria-selected={facet == 'adm'} remove={['facet']} className='rounded-tabs'>
          
          Område
          
          </Clickable>
          </h3>
          <h3>
          <Clickable type="button" role="tab" aria-selected={facet != 'adm'} add={{facet: facetConfig[dataset][0]?.key}} className='rounded-tabs'>
          
          Annet
          
          </Clickable>
          </h3>
          </>
          
        }
        </div>
        { !facet || facet == 'adm' ? <ClientFacet facetName='adm' /> : 
         <ServerFacet showLoading={(facet: string | null) => setLoadingFacet(facet)}/> }
        </>
      )
  }

    


