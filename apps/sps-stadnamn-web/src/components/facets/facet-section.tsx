'use client'
import MiscOptions from "@/app/misc-options"
import Clickable from "@/components/ui/clickable/clickable"
import { datasetTitles } from "@/config/metadata-config"
import { facetConfig } from "@/config/search-config"
import { useFacetParam, useGetAllParam, useGetParam, useGroupParam, useMode, useOptionsOn, useOptionsParam, usePerspective, usePoint, useRadiusParam } from "@/lib/param-hooks"
import { ReservedSearchParamKey } from "@/lib/reserved-param-types"
import { useSearchQuery } from "@/lib/search-params"
import { getSkeletonLength } from "@/lib/utils"
import useResultCardData from "@/state/hooks/result-card-data"
import { GlobalContext } from "@/state/providers/global-provider"
import { useSessionStore } from "@/state/zustand/session-store"
import { useQuery } from "@tanstack/react-query"
import { useRouter, useSearchParams } from "next/navigation"
import { useContext } from "react"
import { PiProhibit, PiX } from "react-icons/pi"

const getFacetFieldCounts = async (searchQueryString: string) => {
  const response = await fetch(`/api/fieldsPresent?${searchQueryString}`)
  const es_data = await response.json()

  return es_data.aggregations?.fields_present?.buckets

}

const RadiusFilter = () => {
  const displayRadius = useSessionStore((s) => s.displayRadius)
  const setDisplayRadius = useSessionStore((s) => s.setDisplayRadius)
  const setDisplayPoint = useSessionStore((s) => s.setDisplayPoint)
  const displayPoint = useSessionStore((s) => s.displayPoint)
  const submittedRadius = useRadiusParam()
  const point = usePoint()

  if (!point) return null

  const handleRadiusChange = (value: string) => {
    setDisplayRadius(value ? parseInt(value) : null)
    setDisplayPoint(point)
  }


  const formatRadius = (radiusValue: number) => {
    if (radiusValue >= 1000) {
      return `${(radiusValue / 1000).toLocaleString('no-NO', { maximumFractionDigits: 2 })} km`
    } else {
      return `${radiusValue} m`
    }
  }


  const currentRadiusValue = displayRadius || submittedRadius || 1000


  return (
    <div className="px-4 py-3 border-b border-neutral-200">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium">
          Avstand frå gjeldande punkt
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <input
            name="radius"
            type="range"
            min="10"
            max="10000"
            step="10"
            value={currentRadiusValue}
            onChange={e => handleRadiusChange(e.target.value)}
            className="accent-primary-700 w-full"
            aria-label="Radius for søk"
          />
        </div>
        <span className="text-sm min-w-0 flex-shrink-0">
          {formatRadius(Number(currentRadiusValue))}
        </span>
      </div>

      <div className="flex gap-2 mt-3">
        {/* Bruk radius */}
        {!submittedRadius && (
          <Clickable
            add={{ radius: displayRadius }}
            onClick={() => {
              setDisplayRadius(null);
              setDisplayPoint(null);
            }}
            className="btn btn-outline"
          >
            Bruk
          </Clickable>
        )}

        {/* Oppdater */}
        {(displayRadius && submittedRadius && displayRadius !== Number(submittedRadius)) && (
          <Clickable
            add={{ radius: displayRadius }}
            className="btn btn-outline"
            onClick={() => {
              setDisplayRadius(null);
              setDisplayPoint(null);
            }}
          >
            Oppdater
          </Clickable>
        )}

        {/* Fjern radius */}
        {submittedRadius && (
          <Clickable
            remove={["radius"]}
            className="btn btn-outline"
          >
            Fjern radius
          </Clickable>
        )}

        {/* Avbryt */}
        {(displayRadius || displayPoint) && (
          <button
            type="button"
            onClick={() => {
              setDisplayRadius(null);
              setDisplayPoint(null);
            }}
            className="btn-outline btn"
          >
            Avbryt
          </button>
        )}
      </div>
    </div>
  )
}

export default function FacetSection() {
  const perspective = usePerspective()
  const mode = useMode()
  const router = useRouter()
  const searchParams = useSearchParams()
  const facet = useFacetParam()
  const datasets = searchParams.getAll('dataset')
  const group = useGroupParam()
  const filterDataset = perspective == 'all' ? datasets.length == 1 ? datasets[0] : 'all' : perspective
  const { facetFilters, datasetFilters, searchQuery } = useSearchQuery()

  const { isMobile } = useContext(GlobalContext)
  const optionsOn = useOptionsOn()
  const options = useOptionsParam()

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

  const getFacetValueMap = (name: string) => {
    // Try to find the facet config for this name in the current dataset/perspective
    const facetsForDataset =
      filterDataset === 'all'
        ? facetConfig['all']
        : facetConfig[filterDataset] || [];

    const facetItem = facetsForDataset.find((f) => f.key === name);
    return facetItem?.valueMap as Record<string, string> | undefined;
  }

  const getChipValue = (name: string, value: string) => {
    const isExcluded = value.startsWith('!')
    const normalizedValue = isExcluded ? value.slice(1) : value
    const values = normalizedValue.split('__')

    // Handle dataset-related filters
    if (name == 'datasetTag' || name == 'dataset' || name == 'datasets') {
      return datasetTitles[normalizedValue] || normalizedValue
    }

    const valueMap = getFacetValueMap(name)
    const baseValue = values[0]

    if (valueMap && valueMap[baseValue]) {
      return valueMap[baseValue]
    }

    // Handle special cases
    if (values[0] == "_false" && name == "adm") {
      if (values.length == 1) return "[inga verdi]"
      return values[1] + " (utan underinndeling)"
    }

    if (values[0] == "_false") return "[ingen verdi]"
    if (normalizedValue == "_true") return normalizedValue

    // Return just the value part
    return values[0]
  }
  /*
  
  const availableFacets = filterDataset == 'all'
      ? facetConfig['all'].filter(f => datasets.length > 0 ? f.datasets?.find((d: string) => datasets.includes(d)) : f.key == 'dataset' || (f.datasets?.length && f.datasets?.length > 1)).sort((a, b) => (a.key === 'dataset' ? -1 : b.key === 'dataset' ? 1 : (b?.datasets?.length || 0) - (a?.datasets?.length || 0)))
      : facetConfig[filterDataset];
    */

  const { searchQueryString } = useSearchQuery()

  const { data: facetFieldCounts, isLoading: facetsLoading } = useQuery({
    queryKey: ['facetFieldCounts', searchQueryString],
    queryFn: () => getFacetFieldCounts(searchQueryString)
  })




  const availableFacets = filterDataset == 'all'
    ? facetConfig['all'].filter(f => {
      // Check if this facet field has count > 0 OR is currently being filtered
      if (f.specialFacet) return true;
      const fieldName = f.key + ((f.type || f.keyword) ? '' : '.keyword');
      const hasCount = facetFieldCounts?.[f.key]?.doc_count > 0 || facetFieldCounts?.[fieldName]?.doc_count > 0;
      const isFiltered = facetFilters.some(([key]) => key === f.key);
      return hasCount || isFiltered;
    }).sort((a, b) => {

      // Active filters first, otherwise preserve order
      const aInParams = searchParams.has(a.key);
      const bInParams = searchParams.has(b.key);
      return Number(!aInParams) - Number(!bInParams);

    }).filter(f => datasets.length > 0 ? f.datasets?.find((d: string) => datasets.includes(d)) : f.key == 'dataset' || (f.datasets?.length && f.datasets?.length > 1))
    :
    facetConfig[filterDataset]?.filter(f => {
      if (f.specialFacet) return true;
      const fieldName = f.key + ((f.type || f.keyword) ? '' : '.keyword');
      const hasCount = facetFieldCounts?.[f.key]?.doc_count > 0 || facetFieldCounts?.[fieldName]?.doc_count > 0;
      const isFiltered = facetFilters.some(([key]) => key === f.key);
      return hasCount || isFiltered;
    });

  const primaryFacetKeys = group ? ['sosi'] : ['adm']
  const prioritizedFacetKeys = new Set<string>([
    ...primaryFacetKeys,
    ...facetFilters.map(([key]) => key),
  ])

  const primaryFacets = availableFacets?.filter(
    (f) => !f.child && prioritizedFacetKeys.has(f.key)
  ) || []

  const otherFacets = availableFacets?.filter(
    (f) => !f.child && f.key !== 'dataset' && !prioritizedFacetKeys.has(f.key)
  ) || []

  const isDesktopMapMode = !isMobile && mode !== 'table'
  const totalFilterCount = facetFilters.length + datasetFilters.length

  // Secondary facets are always visible:
  // - on mobile (when the filter panel is open)
  // - in table mode (desktop behaves like mobile)
  // - on desktop map view when options are open (options toggled via "Fleire filter")
  const shouldShowSecondaryFacets = isMobile || mode === 'table' || optionsOn

  const renderFacetRow = (f: (typeof availableFacets)[number]) => {
    const activeFiltersForFacet = facetFilters.filter(([key]) => key === f.key)
    const hasActiveFilters = activeFiltersForFacet.length > 0

    return (
      <li key={f.key} className={facetsLoading ? 'opacity-50' : ''}>
        <div className="w-full p-3 transition-colors bg-white">
          {/* Header row: title + actions (Legg til + Tøm) */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base truncate font-semibold">{f.label}</span>
              {filterDataset == 'all' && (f.datasets?.length || 0) == 1 && f.datasets?.[0] && (
                <em className="text-neutral-700 text-sm truncate">
                  {datasetTitles[f.datasets?.[0]]}
                </em>
              )}
              {filterDataset != 'all' && f.key.includes('rawData') ? (
                <em className="text-neutral-700 text-sm">Opphavlege data</em>
              ) : null}
            </div>

            <div className="flex items-center  gap-2 flex-shrink-0">
            {activeFiltersForFacet.length > 1 && (
                <Clickable
                  remove={[f.key]}
                  link
                  className="btn btn-compact btn-neutral"
                  aria-label={`Tøm filter for ${f.label}`}
                >
                  Tøm
                </Clickable>
              )}
              <Clickable
                link
                className="btn btn-compact btn-neutral"
                aria-controls={f.key + '-collapsible'}
                add={{ facet: f.key }}
              >
                <span>Legg til</span>
              </Clickable>

              
            </div>
          </div>

          {/* Active chips row: same structure as the Datasett chips row */}
          {hasActiveFilters && (
            <div className="mt-2 w-full">
              <div className="flex flex-wrap items-start gap-1.5 w-full">
                {activeFiltersForFacet.map(([key, value]) => {
                  const isExcluded = value.startsWith('!')
                  return (
                    <button
                      key={`${key}__${value}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFilter(key, value)
                      }}
                      className="px-2 py-1 rounded-md border border-neutral-200 flex items-center gap-1 cursor-pointer text-sm hover:bg-neutral-50"
                    >
                      {isExcluded && (
                        <PiProhibit
                          className="text-sm text-neutral-800 flex-shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      <span className="text-sm">{getChipValue(key, value)}</span>
                      <PiX className="ml-0.5 text-sm" aria-hidden="true" />
                    </button>
                  )
                })}
                <div className="ml-auto" />
              </div>
            </div>
          )}
        </div>
      </li>
    )
  }

  return (


    <div className={`flex flex-col divide-y divide-neutral-200 border-b border-neutral-200 w-full ${isMobile ? 'pb-36' : 'pb-0'}`}>
      {false && <RadiusFilter />}

      {/* Primary facet section: Datasett + primary facets */}
      <ul className="flex flex-col divide-y divide-neutral-200 list-none p-0 m-0">
        <li>
          <div className="w-full p-3 transition-colors bg-white">
            <div className="flex items-center justify-between gap-3">
              <span className={`text-base font-semibold`}>Datasett</span>
              <div className="flex items-center gap-2 flex-shrink-0">
              {datasetFilters.length > 0 && (
                  <Clickable
                    remove={['dataset']}
                    link
                    className="btn btn-compact btn-neutral"
                    aria-label="Tøm filter for datasett"
                  >
                    Tøm
                  </Clickable>
                )}
                <Clickable
                  link
                  className="btn btn-compact btn-neutral"
                  add={{ facet: facet == 'dataset' ? null : 'dataset' }}
                  aria-label="Legg til filter for datasett"
                >
                  <span>Legg til</span>
                </Clickable>

               
              </div>
            </div>

            {datasetFilters.length > 0 && (
              <div className="mt-2 w-full">
                <div className="flex flex-wrap items-start gap-1.5 w-full">
                  {datasetFilters.map(([key, value]) => {
                    const isExcluded = value.startsWith('!')
                    return (
                      <button
                        key={`${key}__${value}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFilter(key, value)
                        }}
                        className="px-2 py-1 rounded-md border border-neutral-200 flex items-center gap-1 cursor-pointer text-sm hover:bg-neutral-50"
                      >
                        {isExcluded && (
                          <PiProhibit
                            className="text-sm text-neutral-800 flex-shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        <span className="text-sm">{getChipValue(key, value)}</span>
                        <PiX className="ml-0.5 text-sm" aria-hidden="true" />
                      </button>
                    )
                  })}
                  <div className="ml-auto" />
                </div>
              </div>
            )}
          </div>
        </li>


      {(facetsLoading && !availableFacets.length) && (
        <>
          {Array.from({ length: 3 }).map((_, index) => (
            <li key={index}>
              <div className="w-full flex justify-between p-3">
                <div className="flex flex-wrap gap-2">
                  <div
                    style={{ width: getSkeletonLength(index, 8, 14) + 'rem' }}
                    className="h-6 bg-neutral-900/10 rounded-full animate-pulse"
                  ></div>
                </div>
                <div className="w-5 h-5 bg-neutral-900/10 rounded-full animate-pulse self-center"></div>
              </div>
            </li>
          ))}
        </>
      )}

      {primaryFacets.map(renderFacetRow)}

      </ul>

      {/* Stadnamnsamlingar + secondary facets */}
      {shouldShowSecondaryFacets && (
        <div className="border-t border-neutral-200">
          {/* Stadnamnsamlingar checkbox block */}
          <MiscOptions />

          {/* Secondary facets */}
          <ul className="flex flex-col divide-y divide-neutral-200 list-none p-0 m-0">
            {otherFacets.map(renderFacetRow)}
          </ul>
        </div>
      )}
    </div>

  )
}




