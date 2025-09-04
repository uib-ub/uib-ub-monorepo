'use client'
import { fieldConfig } from "@/config/search-config"
import { datasetTitles } from "@/config/metadata-config"
import { useSearchQuery } from "@/lib/search-params"
import { useRouter, useSearchParams } from "next/navigation"
import { PiCaretDownBold, PiMagnifyingGlass, PiTrash, PiX } from "react-icons/pi"
import { useContext } from "react"
import { GlobalContext } from "@/app/global-provider"
import Clickable from "@/components/ui/clickable/clickable"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { usePerspective, useMode } from "@/lib/param-hooks"


export default function ActiveFilters() {
    const router = useRouter()
    const { searchQuery, facetFilters, datasetFilters } = useSearchQuery()
    const searchParams = useSearchParams()
    const perspective = usePerspective()
    const mode = useMode()

    const {isMobile, inputValue} = useContext(GlobalContext)
    const fulltext = searchParams.get('fulltext')

    // Get boost_gt parameter for djupinnsamlingar filter
    const boostGt = searchParams.get('boost_gt')
    const cadastralIndex = searchParams.get('cadastralIndex')


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



    return (
      <>

      {datasetFilters.length == 1 && datasetFilters.map(([key, value]) => (
          <button 
              key={`${key}__${value}`} 
              onClick={() => removeFilter(key, value)} 
              className={`text-neutral-950  rounded-md gap-2 pl-3 pr-2 py-1 flex items-center ${mode == 'map' && !isMobile ? 'bg-white shadow-md' : 'border bg-neutral-50 border-neutral-200 box-content'}`}
          >
            {datasetTitles[value]} <PiX className="inline text-lg" aria-hidden="true"/>
          </button>
        ))}
        { datasetFilters.length > 1 && 
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`text-neutral-950 rounded-md gap-2 pl-3 pr-2 py-1 flex items-center ${mode == 'map' && !isMobile ? 'bg-white shadow-md' : 'border bg-neutral-50 border-neutral-200 box-content'}`}>
                {datasetFilters.length} avgrensinger
                <PiCaretDownBold className="inline text-lg" aria-hidden="true"/>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-[4000] bg-white">
              {datasetFilters.map(([key, value]) => (
                <DropdownMenuItem
                  key={`${key}__${value}`}
                  onClick={() => removeFilter(key, value)}
                  className="flex items-center py-2 px-4 cursor-pointer"
                >
                  {datasetTitles[value]}
                  <PiX className="ml-auto text-lg" aria-hidden="true"/>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={clearDatasetFilters}
                className="flex items-center py-2 px-4 cursor-pointer text-accent-700"
              >
                Tøm
                <PiTrash className="ml-auto text-lg" aria-hidden="true"/>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
        {fulltext == 'on' && <Clickable remove={['fulltext']}
      className={`text-neutral-950 rounded-md gap-2 pl-3 pr-2 py-1 flex items-center ${mode == 'map' && !isMobile ? 'bg-white shadow-md' : 'border bg-neutral-50 border-neutral-200 box-content'}`} onClick={() => removeFilter('fulltext', 'on')}>
        <span className="flex items-center">Fulltekstsøk</span>
        <PiX className="inline text-lg" aria-hidden="true"/>
      </Clickable>}
      {/* Search chip */}
      { searchParams.get('q') && <Clickable remove={['q']}
      className={`text-neutral-950 rounded-md gap-2 pl-3 pr-2 py-1 flex items-center ${mode == 'map' && !isMobile ? 'bg-white shadow-md' : 'border bg-neutral-50 border-neutral-200 box-content'}`} onClick={() => {inputValue.current = ""; removeFilter('q', searchParams.get('q')!)}}>
        <span className="flex items-center"><PiMagnifyingGlass className="text-neutral-600 !mr-1" aria-hidden="true"/>{searchParams.get('q')}</span>
        <PiX className="inline text-lg" aria-hidden="true"/>
      </Clickable>}
      
        
        {/* Djupinnsamlingar chip */}
        {boostGt === '3' && !isMobile &&
            <button 
                onClick={() => removeFilter('boost_gt', '3')} 
                className={`text-neutral-950 rounded-md gap-2 pl-3 pr-2 py-1 flex items-center ${mode == 'map' && !isMobile ? 'bg-white shadow-md' : 'border bg-neutral-50 border-neutral-200 box-content'}`}
            >
                Djupinnsamlingar
                <PiX className="inline text-lg" aria-hidden="true"/>
            </button>
        }
        
        {cadastralIndex &&
            <button 
                onClick={() => removeFilter('cadastralIndex', '_true')} 
                className={`text-neutral-950 rounded-md gap-2 pl-3 pr-2 py-1 flex items-center ${mode == 'map' && !isMobile ? 'bg-white shadow-md' : 'border bg-neutral-50 border-neutral-200 box-content'}`}
            >
                Hierarki
                <PiX className="inline text-lg" aria-hidden="true"/>
            </button>
        }
        

        {facetFilters.length > 0 && facetFilters.length < 2 && facetFilters.map(([key, value]) => (
            <button 
                key={`${key}__${value}`} 
                onClick={() => removeFilter(key, value)} 
                className={`text-neutral-950 rounded-full gap-2 pl-3 pr-2 py-1 flex items-center ${mode == 'map' && !isMobile ? 'bg-white shadow-md' : 'border bg-neutral-50 border-neutral-200 box-content'}`}
            >
              {getFieldLabel(key, value)} <PiX className="inline text-lg" aria-hidden="true"/>
            </button>
        ))}

        {facetFilters.length >= 2 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`text-neutral-950 rounded-full gap-2 pl-3 pr-2 py-1 flex items-center ${mode == 'map' && !isMobile ? 'bg-white shadow-md' : 'border bg-neutral-50 border-neutral-200 box-content'}`}>
                {facetFilters.length} filter
                <PiCaretDownBold className="inline text-lg" aria-hidden="true"/>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-[4000] bg-white">
              {facetFilters.map(([key, value]) => (
                <DropdownMenuItem
                  key={`${key}__${value}`}
                  onClick={() => removeFilter(key, value)}
                  className="flex items-center py-2 px-4 cursor-pointer"
                >
                  {getFieldLabel(key, value)}
                  <PiX className="ml-auto text-lg" aria-hidden="true"/>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={clearFilters}
                className="flex items-center py-2 px-4 cursor-pointer text-accent-700"
              >
                Tøm alle
                <PiTrash className="ml-auto text-lg" aria-hidden="true"/>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}


      </>
  )

}