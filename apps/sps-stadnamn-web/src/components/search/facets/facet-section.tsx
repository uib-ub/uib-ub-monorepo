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
        <div className="border-b border-neutral-300 flex gap-2">
        { contentSettings[dataset]?.adm && <>
          <h3>
          <button type="button" role="tab" aria-selected={expandedFacet == 'adm'} onClick={() => toggleFacet('adm')}  className='flex w-full items-center pb-2 px-2 aria-selected:!pb-0 aria-selected:border-b-2 aria-selected:border-accent-800'>
          
          Område
          
          </button>
          </h3>
          <h3>
          <button type="button" role="tab" aria-selected={expandedFacet == 'other'} onClick={() => toggleFacet('other')}  className='flex w-full items-center p px-2 aria-selected:!pb-0 aria-selected:border-b-2 aria-selected:border-accent-800'>
          
          Andre filtre
          
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

    

