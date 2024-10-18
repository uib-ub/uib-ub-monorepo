'use client'

import WithinLabel from "@/app/view/[dataset]/@searchSection/_search-view/WithinLabel"
import { facetConfig } from "@/config/search-config"
import { datasetTitles } from "@/config/metadata-config"
import { useSearchQuery } from "@/lib/search-params"
import { useParams, useRouter } from "next/navigation"


export default function ActiveFilters() {
    const router = useRouter()
    const { searchFilterParamsString, searchQuery } = useSearchQuery()
    

    const getFieldLabel = (name: string, value: string) => {
        const dataset = searchQuery.get('dataset')
        const fieldConfig = dataset ? facetConfig[dataset]?.find(item => item.key == name) : null
        const label = fieldConfig?.label || name
        const omitLabel = fieldConfig?.omitLabel || name == 'adm'
  
        const values = value.split('__')
  
        // Add any special cases here
        if (values[0] == "_false" && name == "adm") {
          if (values.length == 1) return "[utan distrikt]"
          return values[1] + " (utan underinndeling)"
        }
  
        if (name == 'within') {
          return <WithinLabel within={value}/>
        }
          
          
        if (values[0] == "_false") return (label || name) + "Nei"
        if (value == "_true") return (label || name) + "Ja"
        if (name == "datasets") {
          return datasetTitles[value] || value
        }
        return ( omitLabel ? '' : label + ": " ) + values[0]
      }
    


    const removeFilter = (key: string) => {
        const searchParams = new URLSearchParams(searchQuery)
        searchParams.delete(key)
        router.push(`/search?${searchParams.toString()}`)
    }


    return (
        <div className="flex flex-wrap gap-2">
            {Array.from(new URLSearchParams(searchFilterParamsString).keys()).map(key => (
                <button key={key} onClick={() => removeFilter(key)} className="text-neutral-700 hover:text-neutral-900">
                    Fjern {key}
                </button>
            ))
            }
        </div>

    )








}