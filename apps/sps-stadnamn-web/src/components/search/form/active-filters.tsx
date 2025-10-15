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
    const [expandedActiveFilters, setExpandedActiveFilters] = useState<string | null>(null)

    const {isMobile } = useContext(GlobalContext)
    const fulltext = searchParams.get('fulltext')

    // Get boost_gt parameter for djupinnsamlingar filter
    const boostGt = searchParams.get('boost_gt')
    const cadastralIndex = searchParams.get('cadastralIndex')
    const showClearButton = (Number(facetFilters.length > 0) + Number(datasetFilters.length > 0) + Number(fulltext == 'on') + Number(searchParams.get('q') != null)) > 1
    const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition)




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
        const keptParams = ['mode', 'nav', 'facet']
        keptParams.forEach((param: string) => {
          const value = searchParams.get(param)
          if (value) newSearchParams.set(param, value)
        })

        // Add back all values except the one we want to remove
        values.filter(v => v !== value)
            .forEach(v => newSearchParams.append(key, v))
      
        router.push(`?${newSearchParams.toString()}`)
    }

    const clearDatasetFilters = () => {
      const newSearchParams = new URLSearchParams(searchParams)
      datasetFilters.forEach(([key, value]) => {
        newSearchParams.delete(key)
      })
      router.push(`?${newSearchParams.toString()}`)
    }

    const clearFilters = () => {
      const newSearchParams = new URLSearchParams(searchParams)
      facetFilters.forEach(([key, value]) => {

          newSearchParams.delete(key)
        
      })
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




    return (
      <div className="flex flex-wrap gap-2 px-2 pt-2">

{ datasetFilters.length > 1 && datasetFilters.length + facetFilters.length > 2 ?
  <>
    <button 
      className="px-3 py-1.5 rounded-md border border-neutral-200 flex items-center gap-1"
      aria-expanded={expandedActiveFilters == 'datasets'}
      aria-controls="dataset-filters"
      onClick={() => { setExpandedActiveFilters(prev => prev == 'datasets' ? null : 'datasets'); setSnappedPosition('middle')}}
    >
      {datasetFilters.length} datasett
      {expandedActiveFilters == 'datasets' ? <PiCaretUpBold className="inline text-lg" aria-hidden="true"/> : <PiCaretDownBold className="inline text-lg" aria-hidden="true"/>}
    </button>
    {expandedActiveFilters == 'datasets' && <div 
      id="dataset-filters" 
      className="z-[4000] bg-white rounded-md w-full p-1 border border-neutral-200"
    >
      {datasetFilters.map(([key, value]) => (
        <button
          key={`${key}__${value}`}
          onClick={() => removeFilter(key, value)}
          className="flex w-full items-center py-2 px-4 hover:bg-neutral-100 rounded cursor-pointer"
        >
          {datasetTitles[value]}
          <PiX className="ml-auto text-lg" aria-hidden="true"/>
        </button>
      ))}
      <div className="bg-neutral-200 my-1" />
      <button
        onClick={clearDatasetFilters}
        className="flex w-full items-center py-2 px-4 hover:bg-neutral-100 rounded cursor-pointer text-accent-700 px-3 py-1.5"
      >
        Tøm
        <PiTrash className="ml-auto text-lg" aria-hidden="true"/>
      </button>
    </div>}
  </>
  : datasetFilters.map(([key, value]) => (
          <button 
              key={`${key}__${value}`} 
              onClick={() => removeFilter(key, value)} 
              className={`px-3 py-1.5 rounded-md border border-neutral-200 flex items-center gap-1`}
          >
            {datasetTitles[value]} <PiX className="inline text-lg" aria-hidden="true"/>
          </button>
        ))}
        
        {false && fulltext == 'on' && !isMobile && <Clickable remove={['fulltext']}
      className={`text-neutral-950 xl:h-10  rounded-md gap-2 pl-3 pr-2 xl:pl-4 xl:pr-3 py-1 flex items-center bg-white xl:shadow-md border bg-neutral-50 border-neutral-200 box-content xl:border-none`} onClick={() => removeFilter('fulltext', 'on')}>
        <span className="flex items-center">Fulltekstsøk</span>
        <PiX className="inline text-lg" aria-hidden="true"/>
      </Clickable>}

        {facetFilters.length > 0 && facetFilters.length < 2 && facetFilters.map(([key, value]) => (
            <button 
                key={`${key}__${value}`} 
                onClick={() => removeFilter(key, value)} 
                className={`px-3 py-1.5 rounded-md border border-neutral-200 flex items-center gap-2`}
            >
              {getFieldLabel(key, value)} <PiX className="inline text-lg" aria-hidden="true"/>
            </button>
        ))}

        {facetFilters.length >= 2 && (
          <>
            <button 
              className="px-3 py-1.5 rounded-md border border-neutral-200 flex items-center gap-1"
              aria-expanded={expandedActiveFilters == 'facets'}
              aria-controls="facet-filters"
              onClick={() => setExpandedActiveFilters(prev => prev == 'facets' ? null : 'facets')}
            >
              {facetFilters.length} filter
              {expandedActiveFilters == 'facets' 
                ? <PiCaretUpBold className="inline text-lg" aria-hidden="true"/> 
                : <PiCaretDownBold className="inline text-lg" aria-hidden="true"/>}
            </button>
            {expandedActiveFilters == 'facets' && (
              <div 
                id="facet-filters"
                className="z-[4000] bg-white rounded-md w-full p-1 border border-neutral-200"
              >
                {facetFilters.map(([key, value]) => (
                  <button
                    key={`${key}__${value}`}
                    onClick={() => removeFilter(key, value)}
                    className="flex w-full items-center py-2 px-4 hover:bg-neutral-100 rounded cursor-pointer"
                  >
                    {getFieldLabel(key, value)}
                    <PiX className="ml-auto text-lg" aria-hidden="true"/>
                  </button>
                ))}
                <div className="bg-neutral-200 my-1" />
                <button
                  onClick={clearFilters}
                  className="flex w-full items-center py-2 px-4 hover:bg-neutral-100 rounded cursor-pointer text-accent-700"
                >
                  Tøm alle
                  <PiTrash className="ml-auto text-lg" aria-hidden="true"/>
                </button>
              </div>
            )}
          </>
        )}

        {showClearButton && <Clickable remove={['q', ...facetFilters.map(([key, value]) => key), ...datasetFilters.map(([key, value]) => key)]}
        className={`px-3 py-1.5 flex items-center`}>
          Tøm
          <PiTrash className="inline text-lg" aria-hidden="true"/>
        </Clickable>}



      </div>
  )

}