'use client'
import WithinLabel from "./within-label"
import { fieldConfig } from "@/config/search-config"
import { datasetTitles, typeNames } from "@/config/metadata-config"
import { usePerspective, useMode, useSearchQuery } from "@/lib/search-params"
import { useRouter, useSearchParams } from "next/navigation"
import { PiCaretDownBold, PiPushPinFill, PiTrash, PiX } from "react-icons/pi"
import { parseAsString, useQueryState } from "nuqs"
import { DocContext } from "@/app/doc-provider"
import { useContext } from "react"
import { getGnr } from "@/lib/utils"
import { GlobalContext } from "@/app/global-provider"
import Clickable from "@/components/ui/clickable/clickable"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"


export default function ActiveFilters({showDatasets = true, showFacets = true}: {showDatasets?: boolean, showFacets?: boolean}) {
    const router = useRouter()
    const { searchQuery, facetFilters, datasetFilters } = useSearchQuery()
    const searchParams = useSearchParams()
    const perspective = usePerspective()
    const mode = useMode()
    const [fulltext, setFulltext] = useQueryState('fulltext', parseAsString.withDefault('off'))
    const { parentData } = useContext(DocContext)
    const [parent, setParent] = useQueryState('parent')
    const [sourceLabel, setSourceLabel] = useQueryState('sourceLabel')
    const [sourceDataset, setSourceDataset] = useQueryState('sourceDataset')
    const {facetOptions, isMobile} = useContext(GlobalContext)

    // Get boost_gt parameter for djupinnsamlingar filter
    const boostGt = searchParams.get('boost_gt')


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
          return typeNames[value] || value
        }

        if (name == 'indexDataset') {
          return datasetTitles[value] || value
        }
  
        if (name == 'within') {
          return <WithinLabel/>
        }
          
          
        if (values[0] == "_false") return (label || name) + ": Nei"
        if (value == "_true") return (label || name) + ": Ja"
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


          if (searchParams.get('nav') == 'results' && facetFilters.length <= 1 && !searchParams.get('q')) {
            newSearchParams.set('nav', 'filters')
          }



      
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
        if (showFacets || key != 'indexDataset') {
          newSearchParams.delete(key)
        }
      })
      router.push(`?${newSearchParams.toString()}`)
    }



    const gnr =  getGnr(parentData, perspective)



    return (
      <>
        { fulltext == 'on' && 
            <button className={`rounded-full gap-2 pl-3 pr-2 py-1 flex items-center ${(mode == 'map' && !isMobile) ? 'bg-white shadow-md' : 'border bg-neutral-50 border-neutral-200 box-content'}`} onClick={() => setFulltext('off')}>
            Fulltekst 
            <PiX className="inline text-lg" aria-hidden="true"/>
            </button> }
        
        {/* Djupinnsamlingar chip */}
        {boostGt === '3' && 
            <button 
                onClick={() => removeFilter('boost_gt', '3')} 
                className={`text-neutral-950 rounded-md gap-2 pl-3 pr-2 py-1 flex items-center ${mode == 'map' && !isMobile ? 'bg-white shadow-md' : 'border bg-neutral-50 border-neutral-200 box-content'}`}
            >
                Djupinnsamlingar
                <PiX className="inline text-lg" aria-hidden="true"/>
            </button>
        }
        {showDatasets && (datasetFilters.length == 1 || isMobile) && datasetFilters.map(([key, value]) => (
          <button 
              key={`${key}__${value}`} 
              onClick={() => removeFilter(key, value)} 
              className={`text-neutral-950  rounded-md gap-2 pl-3 pr-2 py-1 flex items-center ${mode == 'map' && !isMobile ? 'bg-white shadow-md' : 'border bg-neutral-50 border-neutral-200 box-content'}`}
          >
            {datasetTitles[value]} <PiX className="inline text-lg" aria-hidden="true"/>
          </button>
        ))}
        { showDatasets && !isMobile && datasetFilters.length > 1 && 
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className={`text-neutral-950 rounded-md gap-2 pl-3 pr-2 py-1 flex items-center ${mode == 'map' && !isMobile ? 'bg-white shadow-md' : 'border bg-neutral-50 border-neutral-200 box-content'}`}>
        {datasetFilters.length} datasett
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

          {facetFilters.length > 1 && <button className={`text-neutral-950 text-white  rounded-full gap-2 pl-3 pr-2 py-1 flex items-center bg-accent-700 ${mode == 'map' && !isMobile ? 'shadow-md' : 'border border-neutral-200 box-content'}`} onClick={clearFilters}>Tøm<PiTrash className="inline text-lg" aria-hidden="true"/></button>}
          {!parentData && showFacets && facetFilters.map(([key, value]) => (
              <button 
                  key={`${key}__${value}`} 
                  onClick={() => removeFilter(key, value)} 
                  className={`text-neutral-950  rounded-full gap-2 pl-3 pr-2 py-1 flex items-center ${mode == 'map' && !isMobile ? 'bg-white shadow-md' : 'border bg-neutral-50 border-neutral-200 box-content'}`}
              >
                {getFieldLabel(key, value)} <PiX className="inline text-lg" aria-hidden="true"/>
              </button>
          ))}
          
          {mode == 'map' && parentData?._source && <><Clickable className="text-white bg-accent-800 shadow-md rounded-md gap-2 pl-3 pr-2 py-1 flex items-center" remove={['parent', 'details']}>
            {gnr ? gnr + ' ' +  parentData._source.label : parentData._source.label}
            <PiX className="inline text-lg" aria-hidden="true"/>
            </Clickable>

          </>
            }
      </>
  )








}