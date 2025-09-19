'use client'
import { fieldConfig } from "@/config/search-config"
import { datasetTitles } from "@/config/metadata-config"
import { useSearchQuery } from "@/lib/search-params"
import { useRouter, useSearchParams } from "next/navigation"
import { PiCaretDownBold, PiFunnel, PiMagnifyingGlass, PiTrash, PiX } from "react-icons/pi"
import { useContext, useRef } from "react"
import { GlobalContext } from "@/app/global-provider"
import Clickable from "@/components/ui/clickable/clickable"
import { usePerspective, useMode } from "@/lib/param-hooks"
import CadastreBreadcrumb from "../details/doc/cadastre-breadcrumb"
import ClickableIcon from "@/components/ui/clickable/clickable-icon"


export default function ActiveFilters() {
    const router = useRouter()
    const { searchQuery, facetFilters, datasetFilters } = useSearchQuery()
    const searchParams = useSearchParams()
    const perspective = usePerspective()
    const mode = useMode()
    const nav = searchParams.get('nav')
    const datasetTag = searchParams.get('datasetTag')
    const dataset = searchParams.get('dataset')

    const {isMobile, inputValue} = useContext(GlobalContext)
    const fulltext = searchParams.get('fulltext')

    // Get boost_gt parameter for djupinnsamlingar filter
    const boostGt = searchParams.get('boost_gt')
    const cadastralIndex = searchParams.get('cadastralIndex')
    const showClearButton = (Number(facetFilters.length > 0) + Number(datasetFilters.length > 0) + Number(fulltext == 'on') + Number(searchParams.get('q') != null)) > 1




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




    return (
      <>

      {datasetFilters.length == 1 && datasetFilters.map(([key, value]) => (
          <button 
              key={`${key}__${value}`} 
              onClick={() => removeFilter(key, value)} 
              className={`text-neutral-950  rounded-md gap-2 pl-2 pr-1 xl:pl-4 xl:pr-3 py-1 flex items-center bg-white xl:shadow-md border bg-neutral-50 border-neutral-200 box-content xl:border-none`}
          >
            {datasetTitles[value]} <PiX className="inline text-lg" aria-hidden="true"/>
          </button>
        ))}
        { datasetFilters.length > 1 && 
  <>
    <button 
      className="text-neutral-950 xl:h-10 rounded-md gap-2 pl-3 pr-2 xl:pl-4 xl:pr-3 py-1 flex items-center bg-white xl:shadow-md border bg-neutral-50 border-neutral-200 box-content xl:border-none"
      popoverTarget="dataset-filters-popover"
      popoverTargetAction="toggle"
    >
      {datasetFilters.length} kjeldeval
      <PiCaretDownBold className="inline text-lg" aria-hidden="true"/>
    </button>
    <div 
      id="dataset-filters-popover" 
      popover="auto"
      className="z-[4000] bg-white rounded-md shadow-lg p-1 border border-neutral-200"
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
      <div className="h-px bg-neutral-200 my-1" />
      <button
        onClick={clearDatasetFilters}
        className="flex w-full items-center py-2 px-4 hover:bg-neutral-100 rounded cursor-pointer text-accent-700"
      >
        Tøm
        <PiTrash className="ml-auto text-lg" aria-hidden="true"/>
      </button>
    </div>
  </>
}
        {fulltext == 'on' && !isMobile && <Clickable remove={['fulltext']}
      className={`text-neutral-950 xl:h-10  rounded-md gap-2 pl-3 pr-2 xl:pl-4 xl:pr-3 py-1 flex items-center bg-white xl:shadow-md border bg-neutral-50 border-neutral-200 box-content xl:border-none`} onClick={() => removeFilter('fulltext', 'on')}>
        <span className="flex items-center">Fulltekstsøk</span>
        <PiX className="inline text-lg" aria-hidden="true"/>
      </Clickable>}
      {/* Search chip */}
      { searchParams.get('q') && <Clickable remove={['q']}
      className={`text-neutral-950 rounded-md gap-2 xl:h-10 pl-3 pr-2 xl:pl-4 xl:pr-3 py-1 flex items-center bg-white xl:shadow-md border bg-neutral-50 border-neutral-200 box-content xl:border-none`} onClick={() => {inputValue.current = ""; removeFilter('q', searchParams.get('q')!)}}>
        <span className="flex items-center">{searchParams.get('q')}</span>
        <PiX className="inline text-lg" aria-hidden="true"/>
      </Clickable>}
      
        

        {facetFilters.length > 0 && facetFilters.length < 2 && facetFilters.map(([key, value]) => (
            <button 
                key={`${key}__${value}`} 
                onClick={() => removeFilter(key, value)} 
                className={`text-neutral-950 xl:h-10  rounded-full gap-2 pl-3 pr-2 xl:pl-4 xl:pr-3 py-1 flex items-center bg-white xl:shadow-md border bg-neutral-50 border-neutral-200 box-content xl:border-none`}
            >
              {getFieldLabel(key, value)} <PiX className="inline text-lg" aria-hidden="true"/>
            </button>
        ))}

        {facetFilters.length >= 2 && (
  <>
    <button 
      className="text-neutral-950 xl:h-10 rounded-full gap-2 pl-3 pr-2 xl:pl-4 xl:pr-3 py-1 flex items-center bg-white xl:shadow-md border bg-neutral-50 border-neutral-200 box-content xl:border-none"
      popoverTarget="facet-filters-popover"
      popoverTargetAction="toggle"
    >
      {facetFilters.length} filter
      <PiCaretDownBold className="inline text-lg" aria-hidden="true"/>
    </button>
    <div 
      id="facet-filters-popover" 
      popover="auto"
      className="z-[4000] bg-white rounded-md shadow-lg p-1 border border-neutral-200"
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
      <div className="h-px bg-neutral-200 my-1" />
      <button
        onClick={clearFilters}
        className="flex w-full items-center py-2 px-4 hover:bg-neutral-100 rounded cursor-pointer text-accent-700"
      >
        Tøm alle
        <PiTrash className="ml-auto text-lg" aria-hidden="true"/>
      </button>
    </div>
  </>
)}

        {showClearButton && <Clickable remove={['q', ...facetFilters.map(([key, value]) => key), ...datasetFilters.map(([key, value]) => key)]}
        className={` rounded-full bg-white text-neutral-950 xl:h-10  gap-2 pl-3 pr-2 xl:pl-4 xl:pr-3 py-1 flex items-center  xl:shadow-md box-content border bg-neutral-50 border-neutral-200 box-content xl:border-none`}>
          Tøm
          <PiTrash className="inline text-lg" aria-hidden="true"/>
        </Clickable>}



      </>
  )

}