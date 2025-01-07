'use client'
import { useDataset } from "@/lib/search-params"
import ClientFacet from "./client-facet"
import { contentSettings } from "@/config/server-config"
import ParamLink from "@/components/ui/param-link"
import { useSearchParams } from "next/navigation"
import ServerFacet from "./server-facet"
import { useState } from "react"


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
          <ParamLink type="button" role="tab" aria-selected={facet == 'adm'} add={{facet: 'adm'}} className='rounded-tabs'>
          
          Område
          
          </ParamLink>
          </h3>
          <h3>
          <ParamLink type="button" role="tab" aria-selected={facet == 'other'} add={{facet: 'other'}} className='rounded-tabs'>
          
          Annet
          
          </ParamLink>
          </h3>
          </>
          
        }
        </div>
        { facet == 'adm' ? <ClientFacet facetName='adm' /> : null}
        { facet == 'other' ? <ServerFacet showLoading={(facet: string | null) => setLoadingFacet(facet)}/> : null}
        </>
      )
  }

    


