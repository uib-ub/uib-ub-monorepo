'use client'
import WithinLabel from "./within-label"
import { facetConfig, fieldConfig } from "@/config/search-config"
import { datasetTitles } from "@/config/metadata-config"
import { useDataset, useSearchQuery } from "@/lib/search-params"
import { useRouter, useSearchParams } from "next/navigation"
import { PiPushPin, PiPushPinFill, PiTagFill, PiTrash, PiX } from "react-icons/pi"
import { parseAsString, useQueryState } from "nuqs"
import ParamLink from "@/components/ui/param-link"
import { DocContext } from "@/app/doc-provider"
import { useContext } from "react"
import { treeSettings } from "@/config/server-config"
import { getValueByPath } from "@/lib/utils"
import { GlobalContext } from "@/app/global-provider"


export default function ActiveFilters() {
    const router = useRouter()
    const { searchQuery, facetFilters } = useSearchQuery()
    const searchParams = useSearchParams()
    const dataset = useDataset()
    const [fulltext, setFulltext] = useQueryState('fulltext', parseAsString.withDefault('off'))
    const { parentData } = useContext(DocContext)
    const [parent, setParent] = useQueryState('parent')
    const {facetOptions, updatePinnedFilters, pinnedFilters} = useContext(GlobalContext)
    const visibleUnpinnedFilters = facetFilters.filter(([key, value]) => 
        pinnedFilters[dataset]?.some(([pinnedKey, pinnedValue]) => pinnedKey === key && pinnedValue === value)
    )
    const unpinnedFilters = facetFilters.filter(([key, value]) => 
        !pinnedFilters[dataset]?.some(([pinnedKey, pinnedValue]) => pinnedKey === key && pinnedValue === value)
    )


    const getFieldLabel = (name: string, value: string) => {
        
        const fieldSettings = fieldConfig[dataset][name]
        const label =  fieldSettings.label || name
        const omitLabel = fieldConfig?.omitLabel || name == 'adm'
  
        const values = value.split('__')
        
  
        // Add any special cases here
        if (values[0] == "_false" && name == "adm") {
          if (values.length == 1) return "[utan distrikt]"
          return values[1] + " (utan underinndeling)"
        }
  
        if (name == 'within') {
          return <WithinLabel/>
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

        // Add back mode, nav and facet params if they exist
        const keptParams = ['mode', 'nav', 'facet']
        keptParams.forEach((param: string) => {
          const value = searchParams.get(param)
          if (value) newSearchParams.set(param, value)
        })
        
        // Add back all values except the one we want to remove
        values.filter(v => v !== value)
            .forEach(v => newSearchParams.append(key, v))

        // Update pinned filters if this was a pinned filter
        if (facetOptions[dataset]?.[key]?.pinningActive) {
          updatePinnedFilters(pinnedFilters[dataset]?.filter(([k, v]) => k !== key || v !== value) || [])
        }


      
        router.push(`?${newSearchParams.toString()}`)
    }

    const clearFilters = () => {
      const newSearchParams = new URLSearchParams(searchParams)
      

      // Remove all unpinned facet params
      unpinnedFilters.forEach(([key, value]) => {
        newSearchParams.delete(key)
      })

      router.push(`?${newSearchParams.toString()}`)
    }

    const gnr =  parentData?._source && getValueByPath(parentData._source, treeSettings[dataset]?.subunit) || parentData?._source?.cadastre?.[0]?.gnr?.join(",")

    const mode = searchParams.get('mode') || 'map'

    return (
      <>
        { fulltext == 'on' && 
            <button onClick={() => setFulltext('off')} 
            className="">Fulltekst 
            <PiX className="inline text-lg" aria-hidden="true"/></button> }
            {!parentData && visibleUnpinnedFilters.map(([key, value]) => (
              <button 
                  key={`${key}__${value}`} 
                  onClick={() => removeFilter(key, value)} 
                  className={`text-neutral-950 rounded-full gap-2 pl-3 pr-2 py-1 flex items-center ${mode == 'map' ? 'bg-white shadow-md' : 'border bg-neutral-50 border-neutral-200 box-content'}`}
              >
                <PiPushPinFill className="inline text-lg text-neutral-800" aria-hidden="true"/>
                {getFieldLabel(key, value)}
                <PiX className="inline text-lg" aria-hidden="true"/>
              </button>
          ))}
          {unpinnedFilters.length > 1 && <button className={`text-neutral-950 text-white  rounded-full gap-2 pl-3 pr-2 py-1 flex items-center bg-accent-700 ${mode == 'map' ? 'shadow-md' : 'border border-neutral-200 box-content'}`} onClick={clearFilters}>Tøm<PiTrash className="inline text-lg" aria-hidden="true"/></button>}
            {!parentData && unpinnedFilters.map(([key, value]) => (
              <button 
                  key={`${key}__${value}`} 
                  onClick={() => removeFilter(key, value)} 
                  className={`text-neutral-950  rounded-full gap-2 pl-3 pr-2 py-1 flex items-center ${mode == 'map' ? 'bg-white shadow-md' : 'border bg-neutral-50 border-neutral-200 box-content'}`}
              >
                {getFieldLabel(key, value)} <PiX className="inline text-lg" aria-hidden="true"/>
              </button>
          ))}
          
          {mode == 'map' && parentData?._source && <button className="text-white bg-accent-800 shadow-md rounded-md gap-2 pl-3 pr-2 py-1 flex items-center" onClick={() => setParent(null)}>
            {treeSettings[dataset] ? gnr + ' ' +  parentData._source.label : 'Kilder: ' + parentData._source.label}
            <PiX className="inline text-lg" aria-hidden="true"/></button>}
      </>
  )








}