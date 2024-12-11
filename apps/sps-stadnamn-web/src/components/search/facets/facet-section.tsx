'use client'
import { useQueryState } from "nuqs"
import { useDataset } from "@/lib/search-params"
import ClientFacet from "./client-facet"
import { contentSettings } from "@/config/server-config"


export default function Facets() {
    const dataset = useDataset()
    const [expandedFacet, setExpandedFacet] = useQueryState('facet', {defaultValue: 'adm'})

    const toggleFacet = (facet: string) => {

        setExpandedFacet(currentFacet => currentFacet == facet? null : facet)
      }

      return (
        <>
        <div className="flex flex-wrap items-center gap-1 mx-2">
        { contentSettings[dataset]?.adm && <>
          <h3>
          <button type="button" role="tab" aria-selected={expandedFacet == 'adm'} onClick={() => toggleFacet('adm')}  className='flex w-full items-center px-4 py-1 rounded-full bg-neutral-100 aria-selected:bg-accent-800 aria-selected:text-white'>
          
          Område
          
          </button>
          </h3>
          <h3>
          <button type="button" role="tab" aria-selected={expandedFacet == 'other'} onClick={() => toggleFacet('other')}  className='flex w-full items-center px-4 py-1 rounded-full bg-neutral-100 aria-selected:bg-accent-800 aria-selected:text-white'>
          
          Annet
          
          </button>
          </h3>
          </>
          
        }
        </div>
        { expandedFacet == 'adm' ? <ClientFacet facetName='adm' /> : null}
        { expandedFacet == 'other' ? <ClientFacet facetName='other'/> : null}
        </>
      )
  }

    


