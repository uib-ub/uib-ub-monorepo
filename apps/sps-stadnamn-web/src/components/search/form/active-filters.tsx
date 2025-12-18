'use client'
import Clickable from "@/components/ui/clickable/clickable"
import ClickableIcon from "@/components/ui/clickable/clickable-icon"
import { datasetTitles } from "@/config/metadata-config"
import { fieldConfig } from "@/config/search-config"
import { usePerspective } from "@/lib/param-hooks"
import { useSearchQuery } from "@/lib/search-params"
import { useRouter, useSearchParams } from "next/navigation"
import { PiX } from "react-icons/pi"
import CadastreBreadcrumb from "../details/doc/cadastre-breadcrumb"
import IconButton from "@/components/ui/icon-button"
import { useTreeIsolation } from "@/lib/tree-isolation"


export default function ActiveFilters() {
  const router = useRouter()
  const { searchQuery, facetFilters, datasetFilters } = useSearchQuery()
  const searchParams = useSearchParams()
  const perspective = usePerspective()
  const datasetTag = searchParams.get('datasetTag')
  const tree = searchParams.get('tree')
  const hasTree = !!searchParams.get('tree')
  const { closeTree } = useTreeIsolation()

  const fulltext = searchParams.get('fulltext')

  const showClearButton = (facetFilters.length + datasetFilters.length + Number(fulltext == 'on') + Number(searchParams.get('q') != null)) > 0

  const removeFilter = (key: string, value: string) => {
    const newSearchParams = new URLSearchParams(searchQuery)
    const values = newSearchParams.getAll(key)

    // Remove all values for this key
    newSearchParams.delete(key)

    // Add back mode, nav and facet params if they exist
    const keptParams = ['mode', 'facet', 'options', 'maxResults']
    keptParams.forEach((param: string) => {
      const value = searchParams.get(param)
      if (value) newSearchParams.set(param, value)
    })

    // Add back all values except the one we want to remove
    values.filter(v => v !== value)
      .forEach(v => newSearchParams.append(key, v))

    router.push(`?${newSearchParams.toString()}`)
  }




  const getFieldLabel = (name: string, value: string) => {

    const fieldSettings = fieldConfig[perspective][name]
    const label = fieldSettings.label || name
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
    return (omitLabel ? '' : label + ": ") + values[0]
  }







  //const gnr =  getGnr(parentData, perspective)

  if (tree) {
    return <div className={`text-neutral-950 flex-wrap rounded-md gap-2 xl:h-10 pl-3 pr-2 py-1 flex items-center bg-white xl:shadow-md`}>
      {hasTree && <CadastreBreadcrumb />}
      <IconButton label="Lukk matrikkelvisning" onClick={closeTree}><PiX className="w-6 h-6 self-center flex-shrink-0" /></IconButton>
    </div>
  }


  if (!facetFilters.length && !datasetFilters.length) {
    return null
  }

  // Combine all filters into a flat list
  const allFilters = [...datasetFilters, ...facetFilters]

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
        {allFilters.map(([key, value]) => (
          <button
          type="button"
            key={`${key}__${value}`}
            onClick={() => removeFilter(key, value)}
            className="px-3 py-1.5 rounded-md border border-neutral-200 flex items-center gap-1 cursor-pointer"
          >
            {(key == 'datasetTag' || key == 'dataset' || key == 'datasets')
              ? datasetTitles[value]
              : getFieldLabel(key, value)}
            <PiX className="ml-auto text-lg" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  )

}