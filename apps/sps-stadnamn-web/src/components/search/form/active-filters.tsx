'use client'
import { fieldConfig } from "@/config/search-config"
import { datasetTitles } from "@/config/metadata-config"
import { useSearchQuery } from "@/lib/search-params"
import { useRouter, useSearchParams } from "next/navigation"
import { PiCaretDownBold, PiCaretUpBold, PiFunnel, PiMagnifyingGlass, PiTrash, PiX } from "react-icons/pi"
import { useContext, useRef, useState } from "react"
import { GlobalContext } from "@/state/providers/global-provider"
import Clickable from "@/components/ui/clickable/clickable"
import { usePerspective, useMode } from "@/lib/param-hooks"
import CadastreBreadcrumb from "../details/doc/cadastre-breadcrumb"
import ClickableIcon from "@/components/ui/clickable/clickable-icon"
import { useSessionStore } from "@/state/zustand/session-store"


export default function ActiveFilters() {
    const router = useRouter()
    const { searchQuery, facetFilters, datasetFilters } = useSearchQuery()
    const searchParams = useSearchParams()
    const perspective = usePerspective()
    const mode = useMode()
    const nav = searchParams.get('nav')
    const datasetTag = searchParams.get('datasetTag')
    const dataset = searchParams.get('dataset')
    const [expandedActiveFilters, setExpandedActiveFilters] = useState<Set<string>>(new Set())

    const {isMobile } = useContext(GlobalContext)
    const fulltext = searchParams.get('fulltext')

    // Get boost_gt parameter for djupinnsamlingar filter
    const boostGt = searchParams.get('boost_gt')
    const cadastralIndex = searchParams.get('cadastralIndex')
    const showClearButton = (Number(facetFilters.length > 0) + Number(datasetFilters.length > 0) + Number(fulltext == 'on') + Number(searchParams.get('q') != null)) > 1
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition)
    
    // Combine and group all filters by field name
    const allFilters = [...datasetFilters, ...facetFilters]
    const groupedFilters = allFilters.reduce((acc, [key, value]) => {
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push([key, value])
      return acc
    }, {} as Record<string, Array<[string, string]>>)

    // Get field label for grouping
    const getFieldGroupLabel = (fieldName: string) => {
      if (fieldName == 'datasetTag' || fieldName == 'dataset' || fieldName == 'datasets') {
        return 'Datasett'
      }
      const fieldSettings = fieldConfig[perspective]?.[fieldName]
      return fieldSettings?.label || fieldName
    }

    const toggleFieldGroup = (fieldName: string) => {
      setExpandedActiveFilters(prev => {
        const newSet = new Set(prev)
        if (newSet.has(fieldName)) {
          newSet.delete(fieldName)
        } else {
          newSet.add(fieldName)
        }
        return newSet
      })
      setSnappedPosition('middle')
    }

    const clearFieldGroupFilters = (fieldName: string) => {
      const newSearchParams = new URLSearchParams(searchParams)
      const filters = groupedFilters[fieldName] || []
      filters.forEach(([key, value]) => {
        newSearchParams.delete(key)
      })
      router.push(`?${newSearchParams.toString()}`)
    }




    const getFieldLabel = (name: string, value: string) => {
        
        const fieldSettings = fieldConfig[perspective][name]
        const label =  fieldSettings.label || name
        const omitLabel = fieldSettings?.omitLabel || name == 'adm'
  
        const values = value.split('__')
        
  
        // Add any special cases here
        if (values[0] == "_false" && name == "adm") {
          if (values.length == 1) return "[inga verdi]"
          return values[1] + " (utan underinndeling)"
        }

        if (name == 'datasetTag') {
          return datasetTitles[value] || value
        }


        if (name == 'dataset') {
          return datasetTitles[value] || value
        }
  
        if (values[0] == "_false") return "Utan: " + (label || name)
        if (value == "_true") return "Med: " + (label || name)
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
        const keptParams = ['mode', 'nav', 'facet', 'options', 'results']
        keptParams.forEach((param: string) => {
          const value = searchParams.get(param)
          if (value) newSearchParams.set(param, value)
        })

        // Add back all values except the one we want to remove
        values.filter(v => v !== value)
            .forEach(v => newSearchParams.append(key, v))
      
        router.push(`?${newSearchParams.toString()}`)
    }




    //const gnr =  getGnr(parentData, perspective)

    if (datasetTag == 'tree') {
      return <div className={`text-neutral-950 flex-wrap rounded-md gap-2 xl:h-10 pl-3 pr-2 py-1 flex items-center bg-white xl:shadow-md`}>
        {dataset &&<CadastreBreadcrumb/>}<ClickableIcon label="Lukk matrikkelvisning" remove={["datasetTag"]}><PiX className="w-6 h-6 self-center flex-shrink-0" /></ClickableIcon></div>
    }


    if (!facetFilters.length && !datasetFilters.length) {
      return null
    }




    const clearAllFilters = () => {
      const newSearchParams = new URLSearchParams(searchParams)
      datasetFilters.forEach(([key, value]) => {
        newSearchParams.delete(key)
      })
      facetFilters.forEach(([key, value]) => {
        newSearchParams.delete(key)
      })
      router.push(`?${newSearchParams.toString()}`)
    }

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 px-1">
          <h2 className="text-lg font-semibold text-neutral-900 flex-1 mx-1 my-2">Aktive filter</h2>
          {showClearButton && (
            <Clickable 
              remove={['q', ...facetFilters.map(([key]) => key), ...datasetFilters.map(([key]) => key)]}
              className="py-1.5 flex items-center"
            >
              Nullstill
            </Clickable>
          )}
        </div>
        <div className="flex flex-wrap gap-2 px-1">
          {Object.entries(groupedFilters).map(([fieldName, filters]) => {
            const isExpanded = expandedActiveFilters.has(fieldName)
            const filterCount = filters.length
            const groupLabel = getFieldGroupLabel(fieldName)

            // If only one filter, show it directly without collapsing
            if (filterCount === 1) {
              const [key, value] = filters[0]
              return (
                <div key={`${fieldName}__single`} className="w-full flex gap-2">
                  <button 
                    onClick={() => removeFilter(key, value)} 
                    className="flex-1 px-3 py-1.5 rounded-md border border-neutral-200 flex items-center gap-1"
                  >
                    {(key == 'datasetTag' || key == 'dataset' || key == 'datasets') 
                      ? datasetTitles[value] 
                      : getFieldLabel(key, value)}
                    <PiX className="ml-auto text-lg" aria-hidden="true"/>
                  </button>
                </div>
              )
            }

          // Multiple filters - show collapsed button
          return (
            <div key={fieldName} className="contents">
              <div className="w-full flex gap-2">
                <button 
                  className="flex-1 px-3 py-1.5 rounded-md border border-neutral-200 flex items-center gap-1"
                  aria-expanded={isExpanded}
                  aria-controls={`filter-group-${fieldName}`}
                  onClick={() => toggleFieldGroup(fieldName)}
                >
                  {filterCount} {(fieldName == 'datasetTag' || fieldName == 'dataset' || fieldName == 'datasets') ? 'datasett' : groupLabel.toLowerCase()}
                  {isExpanded ? <PiCaretUpBold className="inline text-lg ml-auto" aria-hidden="true"/> : <PiCaretDownBold className="inline text-lg ml-auto" aria-hidden="true"/>}
                </button>
                <button
                  onClick={() => clearFieldGroupFilters(fieldName)}
                  className="px-3 py-1.5 rounded-md border border-neutral-200 flex items-center"
                >
                  Tøm
                </button>
              </div>
              {isExpanded && (
                <div 
                  id={`filter-group-${fieldName}`}
                  className="z-[4000] bg-white rounded-md w-full p-1 border border-neutral-200"
                >
                  {filters.map(([key, value]) => (
                    <button
                      key={`${key}__${value}`}
                      onClick={() => removeFilter(key, value)}
                      className="flex w-full items-center py-2 px-4 hover:bg-neutral-100 rounded cursor-pointer"
                    >
                      {(key == 'datasetTag' || key == 'dataset' || key == 'datasets') 
                        ? datasetTitles[value] 
                        : getFieldLabel(key, value)}
                      <PiX className="ml-auto text-lg" aria-hidden="true"/>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
          })}
          
          {false && fulltext == 'on' && !isMobile && <Clickable remove={['fulltext']}
        className={`text-neutral-950 xl:h-10  rounded-md gap-2 pl-3 pr-2 xl:pl-4 xl:pr-3 py-1 flex items-center bg-white xl:shadow-md border bg-neutral-50 border-neutral-200 box-content xl:border-none`} onClick={() => removeFilter('fulltext', 'on')}>
          <span className="flex items-center">Fulltekstsøk</span>
          <PiX className="inline text-lg" aria-hidden="true"/>
        </Clickable>}
        </div>
      </div>
  )

}