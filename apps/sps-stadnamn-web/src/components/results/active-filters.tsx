'use client'
import Clickable from "@/components/ui/clickable/clickable"
import ClickableIcon from "@/components/ui/clickable/clickable-icon"
import { datasetTitles } from "@/config/metadata-config"
import { fieldConfig } from "@/config/search-config"
import { useMode, useFacetParam, useOptionsParam, usePerspective, useQParam, useFulltextOn } from "@/lib/param-hooks"
import { ReservedSearchParamKey } from "@/lib/reserved-param-types"
import { useSearchQuery } from "@/lib/search-params"
import { useRouter, useSearchParams } from "next/navigation"
import { PiProhibit, PiX } from "react-icons/pi"


export default function ActiveFilters() {
  const router = useRouter()
  const { searchQuery, facetFilters, datasetFilters } = useSearchQuery()
  const searchParams = useSearchParams()
  const perspective = usePerspective()

  const fulltextOn = useFulltextOn()
  const qParam = useQParam()
  const mode = useMode()
  const facet = useFacetParam()
  const options = useOptionsParam()

  const showClearButton =
    (facetFilters.length + datasetFilters.length + Number(fulltextOn) + Number(qParam != null)) > 0

  const removeFilter = (key: string, value: string) => {
    const newSearchParams = new URLSearchParams(searchQuery)
    const values = newSearchParams.getAll(key)

    // Remove all values for this key
    newSearchParams.delete(key)

    // Add back mode, nav and facet params if they exist
    const keptParams: Partial<Record<ReservedSearchParamKey, string | null>> = {
      mode, 
      facet,
      options
    }
    Object.entries(keptParams).forEach(([key, value]) => {
      if (value) newSearchParams.set(key, value)
    })

    // Add back all values except the one we want to remove
    values.filter(v => v !== value)
      .forEach(v => newSearchParams.append(key, v))

    router.push(`?${newSearchParams.toString()}`)
  }




  const getFieldLabel = (name: string, value: string) => {

    const fieldSettings = fieldConfig[perspective]?.[name] || {}
    const label = (fieldSettings as any).label || name
    const omitLabel = fieldSettings?.omitLabel || name == 'adm'

    const isExcluded = value.startsWith('!')
    const normalizedValue = isExcluded ? value.slice(1) : value
    const values = normalizedValue.split('__')

    // Add any special cases here
    if (values[0] == "_false" && name == "adm") {
      if (values.length == 1) return "[inga verdi]"
      return values[1] + " (utan underinndeling)"
    }

    if (name == 'datasetTag') {
      return datasetTitles[normalizedValue] || normalizedValue
    }

    if (name == 'dataset') {
      return datasetTitles[normalizedValue] || normalizedValue
    }

    if (!isExcluded && normalizedValue == "_true") {
      return "Med: " + (label || name)
    }

    if (values[0] == "_false") {
      // Generic "no value" case – include field label so chips stay clear
      const valueLabel = "[ingen verdi]"
      return (omitLabel ? '' : label + ": ") + valueLabel
    }

    if (name == "datasets") {
      return datasetTitles[normalizedValue] || normalizedValue
    }

    // Map via valueMap if available (e.g. resources)
    const baseKey = values[0]
    const mapped = (fieldSettings as any).valueMap?.[baseKey]
    if (mapped) {
      return mapped
    }

    return (omitLabel ? '' : label + ": ") + values[0]
  }







  //const gnr =  getGnr(parentData, perspective)


  if (!facetFilters.length && !datasetFilters.length) {
    return null
  }

  // Combine all filters into a flat list
  const allFilters = [...datasetFilters, ...facetFilters]

  return (
    <section className="flex flex-col gap-2" aria-labelledby="active-filters-title">
      <div className="flex items-center gap-2 px-1">
        <div id="active-filters-title" className="text-lg font-semibold text-neutral-900 flex-1 mx-1 my-2">Aktive filter</div>
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
        {allFilters.map(([key, value]) => {
          const isExcluded = value.startsWith('!')
          const normalizedValue = isExcluded ? value.slice(1) : value
          const label = (key == 'datasetTag' || key == 'dataset' || key == 'datasets')
            ? (datasetTitles[normalizedValue] || normalizedValue)
            : getFieldLabel(key, value)

          return (
            <button
              type="button"
              key={`${key}__${value}`}
              onClick={() => removeFilter(key, value)}
              className="px-3 py-1.5 rounded-md border border-neutral-200 flex items-center gap-1 cursor-pointer"
            >
              {isExcluded && (
                <PiProhibit
                  className="text-sm text-neutral-800 flex-shrink-0"
                  aria-hidden="true"
                />
              )}
              <span className="text-sm">{label}</span>
              <PiX className="ml-auto text-lg" aria-hidden="true" />
            </button>
          )
        })}
      </div>
    </section>
  )

}