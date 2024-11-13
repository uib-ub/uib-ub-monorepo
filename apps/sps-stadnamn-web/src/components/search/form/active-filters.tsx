'use client'
import WithinLabel from "@/app/view/[dataset]/@searchSection/_search-view/WithinLabel"
import { facetConfig } from "@/config/search-config"
import { datasetTitles } from "@/config/metadata-config"
import { useSearchQuery } from "@/lib/search-params"
import { useRouter, useSearchParams } from "next/navigation"
import { PiX } from "react-icons/pi"


export default function ActiveFilters() {
    const router = useRouter()
    const { searchQuery, facetFilters } = useSearchQuery()
    const searchParams = useSearchParams()

    
    

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
    


      const removeFilter = (key: string, value: string) => {
        const newSearchParams = new URLSearchParams(searchQuery)
        const values = newSearchParams.getAll(key)
        
        // Remove all values for this key
        newSearchParams.delete(key)

        // Add expanded if it exists
        const expanded = searchParams.get('expanded')
        if (expanded) {
          newSearchParams.set('expanded', expanded)
        }
        const facet = searchParams.get('facet')
        if (facet) {
          newSearchParams.set('facet', facet)
        }
        
        // Add back all values except the one we want to remove
        values.filter(v => v !== value)
            .forEach(v => newSearchParams.append(key, v))
    
        router.push(`?${newSearchParams.toString()}`)
    }


    return (
      <div className="flex flex-wrap gap-2 mt-2">
          {facetFilters.map(([key, value]) => (
              <button 
                  key={`${key}__${value}`} 
                  onClick={() => removeFilter(key, value)} 
                  className="text-neutral-950 bg-white shadow-md rounded-full pl-3 pr-2 py-1"
              >
                  {getFieldLabel(key, value)} <PiX className="inline text-lg" />
              </button>
          ))}
      </div>
  )








}