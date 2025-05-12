import { useState, useEffect, useContext, ChangeEvent, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDataset, useSearchQuery } from '@/lib/search-params';
import { facetConfig, fieldConfig } from '@/config/search-config';
import { PiMagnifyingGlass } from 'react-icons/pi';

import { datasetTitles, typeNames, datasetTypes } from '@/config/metadata-config';

import FacetToolbar from './facet-toolbar';
import { GlobalContext } from '@/app/global-provider';
import { getSkeletonLength } from '@/lib/utils';


export default function ServerFacet() {
  const router = useRouter()
  const dataset = useDataset()
  const searchParams = useSearchParams()
  const { removeFilterParams } = useSearchQuery()
  const [facetAggregation, setFacetAggregation] = useState<any | undefined>(undefined);
  const [facetLoading, setFacetLoading] = useState(true);
  const [facetSearch, setFacetSearch] = useState('');
  const [clientSearch, setClientSearch] = useState(''); // For fields that have labels defined in the config files
  const {facetOptions, pinnedFilters, updatePinnedFilters } = useContext(GlobalContext)
  const availableFacets = useMemo(() => facetConfig[dataset], [dataset]);
  const facet = searchParams.get('facet')
  const [sortMode, setSortMode] = useState<'doc_count' | 'asc' | 'desc'>(availableFacets && availableFacets[0]?.sort || 'doc_count');
  const paramsExceptFacet = facet ? removeFilterParams(facet) : searchParams.toString()

  useEffect(() => {
    // Return if no facet or invalid facet
    if (!facet || !availableFacets.some(f => f.key === facet)) {
      return
    }

    // Fetch data only if we have a valid facet
    fetch(`/api/facet?facets=${facet}${
      facetSearch ? '&facetSearch=' + facetSearch + "*" : ''}${
        paramsExceptFacet ? '&' + paramsExceptFacet : ''}${
          sortMode != 'doc_count' ? '&facetSort=' + sortMode : ''}`).then(response => response.json()).then(es_data => {
      
      if (facet.includes('__')) {
        const [parent, child] = facet.split('__')
        setFacetAggregation(es_data.aggregations?.[parent]?.[child])
      }
      else {
        setFacetAggregation(es_data.aggregations?.[facet])
      }

      setFacetLoading(false);
    })
  }, [facet, availableFacets, paramsExceptFacet, facetSearch, sortMode])


  // Return null if we don't have a valid facet
  if (!facet || !availableFacets.some(f => f.key === facet)) {
    return null;
  }

  const switchFacet = (event: ChangeEvent<HTMLSelectElement>) => {
    const facet = event.target.value
    event.preventDefault()
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set('facet', facet)
    router.push(`?${newParams.toString()}`, { scroll: false });
  }

  const renderLabel = (key: string, label: string) => {
    if (label == '_false') return '[ingen verdi]'
    if (key == 'datasets') return datasetTitles[label]
    if (key == 'indexDataset') return datasetTitles[label.split('-')[2]]
    return label
  }

  const toggleFilter = (beingChecked: boolean, facet: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Remove existing value if present
    const existingValues = params.getAll(facet);
    params.delete(facet);

    // reset because different markers should be shown
    params.delete('parent')
    params.delete('zoom')
    params.delete('center')
    params.delete('doc')
    
    // For indexDataset, convert all values to dataset tags before filtering
    if (facet === 'indexDataset') {
      const currentValue = value.split('-')[2];
      existingValues
        .filter(v => v !== currentValue)
        .forEach(v => params.append(facet, v));
    } else {
      // For other facets, handle as before
      existingValues
        .filter(v => v !== value)
        .forEach(v => params.append(facet, v));
    }

    // Add the value if being checked
    if (beingChecked) {
      if (facet === 'indexDataset') {
        const datasetTag = value.split('-')[2];
        params.append(facet, datasetTag);
      } else {
        params.append(facet, value);
      }
    }

    if (facetOptions[dataset]?.[facet]?.pinningActive) {
      updatePinnedFilters(beingChecked ? [...pinnedFilters[dataset], [facet, value]] 
          : pinnedFilters[dataset]?.filter(([k, v]) => (k == facet && v == value) ? false : true))
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };
    

  const filterDatasetsByTags = (item: any) => {
    if ((facet === 'datasets' || facet === 'indexDataset') && searchParams.getAll('datasetTag').length > 0) {
      // Check if the dataset (item.key) has all the required dataset tags
      return searchParams.getAll('datasetTag').every(tag => 
        datasetTypes[facet == 'indexDataset' ? item.key.split('-')[2] : item.key]?.includes(tag)
      );
    }
    return true;
  };

  const isChecked = (facet: string, itemKey: string) => {
    const existingValues = searchParams.getAll(facet);
    if (facet === 'indexDataset') {
      // For indexDataset, compare against the dataset tag portion
      const datasetTag = itemKey.split('-')[2];
      return existingValues.includes(datasetTag);
    }
    return existingValues.includes(itemKey.toString());
  };

  return (
    <>
    <div className="flex flex-col gap-2 pb-4">
    <div className='flex flex-col gap-2'>
    {((dataset =='search' && facet == 'datasets') || (dataset == 'all' && facet == 'indexDataset')) && 
    <div className='flex gap-2'>
      <div className='flex flex-wrap gap-2'>
        {Object.entries(typeNames)
          .filter(([type]) => {
            // Don't show already selected types
            if (searchParams.getAll('datasetTag').includes(type)) return false;
            
            // Only show types that exist in the current facet buckets
            return facetAggregation?.buckets
              .filter(filterDatasetsByTags)
              .some((item: any) => datasetTypes[facet == 'datasets' ? item.key : item.key.split('-')[2]]?.includes(type));
          })
          .map(([type, label]) => (
          <button 
            key={type}
            className='btn btn-outline btn-compact'
            onClick={() => {
              setClientSearch('');
              const params = new URLSearchParams(searchParams.toString());
              const existingTags = params.getAll('datasetTag');
              if (!existingTags.includes(type)) {
                params.append('datasetTag', type);
              }
              router.push(`?${params.toString()}`, { scroll: false });
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
    
    
    }
    <div className='flex gap-2'>
    <div className='relative grow'>
      <input aria-label="Søk i fasett" onChange={(e) => (facet == 'datasets' || facet == 'indexDataset') ? setClientSearch(e.target.value) : setFacetSearch(e.target.value)}
          className="pl-8 w-full border rounded-md border-neutral-300 p-1"/>
      <span className="absolute left-2 top-1/2 transform -translate-y-1/2">
        <PiMagnifyingGlass aria-hidden={true} className='text-neutral-500 text-xl'/>
      </span>
    </div>

    <FacetToolbar/>
    </div>
    </div>

    { (facetLoading || facetAggregation?.buckets.length) ?
    <fieldset>
      <legend className="sr-only">{`Filtreringsalternativer for ${fieldConfig[dataset][facet].label}`}</legend>
      <ul role="status" aria-live="polite" className='flex flex-col gap-2 p-2 stable-scrollbar xl:overflow-y-auto inner-slate'>
        {facetAggregation?.buckets.length ? facetAggregation?.buckets
          .filter(filterDatasetsByTags)
          .map((item: any, index: number) => 
            (!clientSearch?.length || new RegExp(`(^|\\s)${clientSearch.replace(/[*.+?^${}()|[\]\\]/g, '\\$&')}`, 'iu').test(renderLabel(facet, item.key))) && (
              <li key={index}>
                <label>
                  <input 
                    type="checkbox" 
                    checked={isChecked(facet, item.key)} 
                    className='mr-2' 
                    name={facet} 
                    value={item.key} 
                    onChange={(e) => { toggleFilter(e.target.checked, e.target.name, e.target.value) }}
                  />
                  {renderLabel(facet, item.key)} <span className="bg-white border border-neutral-300 shadow-sm text-xs px-2 py-[1px] rounded-full">{item.doc_count}</span>
                </label>
              </li>
          ))
          : <li>
              <div className="flex flex-col gap-3">
                {Array.from({length: 6}).map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div style={{width: getSkeletonLength(index, 8, 16) + 'rem'}} className="h-4 bg-neutral-200 rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            </li>
        }
      </ul>
    </fieldset>
    : <div role="status" aria-live="polite" className='px-2 p-2 rounded-sm bg-neutral-50 border border-neutral-300'>Ingen treff</div>
    }
    </div>
   </>)

}