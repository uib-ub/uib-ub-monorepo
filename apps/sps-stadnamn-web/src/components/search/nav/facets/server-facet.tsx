import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSearchQuery } from '@/lib/search-params';
import { facetConfig, fieldConfig } from '@/config/search-config';
import { PiMagnifyingGlass } from 'react-icons/pi';

import { datasetTitles } from '@/config/metadata-config';

import FacetToolbar from './facet-toolbar';
import { formatNumber, getSkeletonLength } from '@/lib/utils';
import Clickable from '@/components/ui/clickable/clickable';
import { usePerspective } from '@/lib/param-hooks';
import { FacetBadge } from '@/components/ui/badge';
import PercentageCircle from './percentage-circle';




export default function ServerFacet() {
  const router = useRouter()
  const perspective = usePerspective()
  const searchParams = useSearchParams()
  const { removeFilterParams } = useSearchQuery()
  const [facetAggregation, setFacetAggregation] = useState<any | undefined>(undefined);
  const [facetLoading, setFacetLoading] = useState(true);
  const [facetSearch, setFacetSearch] = useState('');
  const [clientSearch, setClientSearch] = useState(''); // For fields that have labels defined in the config files
  const availableFacets = useMemo(() => facetConfig[perspective], [perspective]);
  const facet = searchParams.get('facet') || searchParams.get('nav')
  const [sortMode, setSortMode] = useState<'doc_count' | 'asc' | 'desc'>(availableFacets && availableFacets[0]?.sort || 'doc_count');
  const paramsExceptFacet = facet ? removeFilterParams(facet) : searchParams.toString()
  const currentValue = facet && searchParams.get(facet)

  const allCount = facetAggregation?.buckets ? facetAggregation.buckets.reduce((sum: number, item: { doc_count: number }) => sum + item.doc_count, 0) : 0;

  const yesCount = facetAggregation?.buckets ? facetAggregation.buckets.reduce((sum: number, item: { doc_count: number, key: string }) => item.key !== '_false' ? sum + item.doc_count : sum, 0) : 0;

  const noCount = facetAggregation?.buckets ? facetAggregation.buckets.reduce((sum: number, item: { doc_count: number, key: string }) => item.key === '_false' ? sum + item.doc_count : sum, 0) : 0;

  useEffect(() => {
    // Return if no facet or invalid facet
    if (!facet || !availableFacets.some(f => f.key === facet)) {
      return
    }

    // Fetch data only if we have a valid facet
    fetch(`/api/facet?perspective=${perspective}&facets=${facet}${
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
  }, [facet, availableFacets, paramsExceptFacet, facetSearch, sortMode, perspective])


  // Return null if we don't have a valid facet
  if (!facet || !availableFacets.some(f => f.key === facet)) {
    return null;
  }

  const renderLabel = (key: string, label: string) => {
    if (label == '_false') return '[ingen verdi]'
    if (key == 'datasets') return datasetTitles[label]
    return label
  }

  const toggleFilter = (beingChecked: boolean, facet: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Remove existing value if present
    const existingValues = params.getAll(facet);
    params.delete(facet);

    params.delete('page')

    // reset because different markers should be shown
    params.delete('parent')
    params.delete('zoom')
    params.delete('center')
    params.delete('doc')
    params.delete('group')
    params.delete('init')
    
    existingValues
      .filter(v => v !== value)
      .forEach(v => params.append(facet, v));
    

    // Add the value if being checked
    if (beingChecked) {
      params.append(facet, value);
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };
    

  const isChecked = (facet: string, itemKey: string) => {
    const existingValues = searchParams.getAll(facet);
    return existingValues.includes(itemKey.toString());
  };

  // Memoized RegExp factory to prevent memory leaks
  const createSearchRegex = (() => {
    const cache = new Map();
    return (searchTerm: string) => {
      if (!searchTerm) return null;
      const escaped = searchTerm.replace(/[*.+?^${}()|[\]\\]/g, '\\$&');
      const pattern = `(^|\\s)${escaped}`;
      if (!cache.has(pattern)) {
        cache.set(pattern, new RegExp(pattern, 'iu'));
      }
      return cache.get(pattern);
    };
  })();

  return (
    <>
    <div className="flex flex-col gap-2">
    { yesCount < allCount && (
  <div className="flex bg-white rounded-lg tabs pb-2">
    {!facetLoading &&  (
      <>
        <Clickable
          remove={[facet]}
          add={{ [facet]: '_true'}}
          aria-pressed={currentValue == '_true'}
          className={`flex-1 group gap-1 !justify-start py-1.5 !px-2 text-left`}
        >
          Med {Math.round((yesCount / allCount) * 100)}%
        </Clickable>

        <Clickable
          remove={[facet]}
          add={{ [facet]: '_false'}}
          aria-pressed={currentValue == '_false'}
          className={`flex-1 group gap-1 !justify-start py-1.5 !px-2 text-left`}
        >
          Utan {Math.round((noCount / allCount) * 100)}%
        </Clickable>
        <button
          onClick={() => {
            router.push(`?${new URLSearchParams(Array.from(searchParams.entries()).filter(([key, value]) => key != facet || (value != '_true' && value != '_false')))}`)
          }}
          aria-pressed={currentValue != '_true' && currentValue != '_false'}
          className={`flex-1 group gap-1 !justify-start py-1.5 !px-2 text-left`}
        >
          Alle <FacetBadge count={allCount} />
        </button>
      </>
    )}
  </div>
)}
</div>
  <div className='flex gap-2'>
    
      
   
  

    {currentValue != '_true' && currentValue != '_false' && 
    <div className='flex gap-2 flex-col w-full'>
      <div className='flex gap-2'>
      <div className='relative flex-1 min-w-0'> {/* flex-1 to take remaining space, min-w-0 allows shrinking below content size */}
    <input 
      aria-label="Søk i fasett" 
      onChange={(e) => facet == 'datasets' ? setClientSearch(e.target.value) : setFacetSearch(e.target.value)}
      className="pl-8 w-full h-full border rounded-md border-neutral-300"
    />
    <span className="absolute left-2 top-1/2 transform -translate-y-1/2">
      <PiMagnifyingGlass aria-hidden={true} className='text-neutral-500 text-xl'/>
    </span>
  </div>


  <div className="flex-shrink-0"> {/* Keep toolbar buttons from shrinking */}
    <FacetToolbar/>
  </div>
  </div>
    
    {  (facetLoading || facetAggregation?.buckets.length) ?
    <fieldset>
      <legend className="sr-only">{`Filtreringsalternativer for ${fieldConfig[perspective][facet].label}`}</legend>
      <ul aria-live="polite" className='flex flex-col gap-2 p-2 stable-scrollbar xl:overflow-y-auto mb-2'>
        {facetAggregation?.buckets.length ? facetAggregation?.buckets
          .map((item: any, index: number) => 
            (!clientSearch?.length || createSearchRegex(clientSearch)?.test(renderLabel(facet, item.key))) && (
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
                  {renderLabel(facet, item.key)} <FacetBadge count={item.doc_count} />
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
    </div>}
    </div>
   </>)

}