import { facetConfig, fieldConfig } from '@/config/search-config';
import { useSearchQuery } from '@/lib/search-params';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { PiMagnifyingGlass, PiProhibit } from 'react-icons/pi';

import { datasetTitles } from '@/config/metadata-config';

import { FacetBadge } from '@/components/ui/badge';
import Clickable from '@/components/ui/clickable/clickable';
import { usePerspective } from '@/lib/param-hooks';
import { getSkeletonLength } from '@/lib/utils';
import FacetToolbar from './facet-toolbar';
import { usePreferences } from '@/state/zustand/persistent-preferences';




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
  const facet = searchParams.get('facet')
  const [sortMode, setSortMode] = useState<'doc_count' | 'asc' | 'desc'>(availableFacets && availableFacets[0]?.sort || 'doc_count');
  const paramsExceptFacet = facet ? removeFilterParams(facet) : searchParams.toString()
  const currentValue = facet && searchParams.get(facet)

  const allCount = facetAggregation?.buckets ? facetAggregation.buckets.reduce((sum: number, item: { doc_count: number }) => sum + item.doc_count, 0) : 0;

  const facetCountMode = usePreferences((state) => state.facetCountMode);

  useEffect(() => {
    // Return if no facet or invalid facet
    if (!facet || !availableFacets.some(f => f.key === facet)) {
      return
    }

    // Fetch data only if we have a valid facet
    fetch(`/api/facet?perspective=${perspective}&facets=${facet}${facetSearch ? '&facetSearch=' + facetSearch + "*" : ''}${paramsExceptFacet ? '&' + paramsExceptFacet : ''}${sortMode != 'doc_count' ? '&facetSort=' + sortMode : ''}`).then(response => response.json()).then(es_data => {

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
    // Use valueMap from facet configuration if available
    const facetConfigItem = availableFacets.find(f => f.key === key);
    const rawValue = label.split('__')[0];
    if (facetConfigItem?.valueMap && facetConfigItem.valueMap[rawValue]) {
      return facetConfigItem.valueMap[rawValue];
    }

    if (label == '_false') return '[ingen verdi]'
    if (key == 'datasets') return datasetTitles[label]
    return label
  }

  const toggleFilter = (beingChecked: boolean, facet: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // Remove existing values for this facet so we can rebuild it
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
      .filter(v => v !== value && v !== `!${value}`)
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

  const isExcluded = (facet: string, itemKey: string) => {
    const existingValues = searchParams.getAll(facet);
    return existingValues.includes(`!${itemKey.toString()}`);
  };

  const toggleExclude = (facet: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    const existingValues = params.getAll(facet);
    params.delete(facet);

    params.delete('page');

    // reset because different markers should be shown
    params.delete('parent');
    params.delete('zoom');
    params.delete('center');
    params.delete('doc');
    params.delete('group');
    params.delete('init');

    const negativeValue = `!${value}`;

    const withoutCurrent = existingValues.filter(
      (v) => v !== value && v !== negativeValue
    );

    withoutCurrent.forEach((v) => params.append(facet, v));

    const currentlyExcluded = existingValues.includes(negativeValue);

    // If it's not currently excluded, add the negative value
    if (!currentlyExcluded) {
      params.append(facet, negativeValue);
    }

    router.push(`?${params.toString()}`, { scroll: false });
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
        {currentValue != '_true' && currentValue != '_false' &&
          <div className='flex flex-col gap-2'>
            <div className='flex gap-2 px-2 pt-1'>
              <div className='w-full h-10 relative'>
                <input
                  aria-label="Søk i fasett"
                  onChange={(e) => facet == 'datasets' ? setClientSearch(e.target.value) : setFacetSearch(e.target.value)}
                  className="pl-8 w-full border rounded-md border-neutral-300 h-full px-2"
                />
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2">
                  <PiMagnifyingGlass aria-hidden={true} className='text-neutral-700 text-xl' />
                </span>
              </div>
            </div>

            <FacetToolbar />

            {(facetLoading || facetAggregation?.buckets.length) ?
              <fieldset>
                <legend className="sr-only">{`Filtreringsalternativer for ${fieldConfig[perspective][facet].label}`}</legend>
                <ul aria-live="polite" className='flex flex-col px-2 divide-y divide-neutral-200'>
                  {facetAggregation?.buckets.length ? facetAggregation?.buckets
                    .map((item: any, index: number) => {
                      const displayCount =
                        facetCountMode === 'percent' && allCount > 0
                          ? Math.round((item.doc_count / allCount) * 100)
                          : item.doc_count;

                      return (!clientSearch?.length || createSearchRegex(clientSearch)?.test(renderLabel(facet, item.key))) && (
                        <li key={index} className='py-3'>
                          <div className="flex items-center gap-2 px-2">
                            <label className="flex items-center gap-2 lg:gap-1 xl:gap-2 flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked={isChecked(facet, item.key)}
                                className="mr-2 flex-shrink-0"
                                name={facet}
                                value={item.key}
                                onChange={(e) => { toggleFilter(e.target.checked, e.target.name, e.target.value) }}
                              />
                              <span className="text-neutral-950 break-words lg:text-sm xl:text-base min-w-0">
                                {renderLabel(facet, item.key)} <FacetBadge count={displayCount} mode={facetCountMode} />
                              </span>
                            </label>
                            <button
                              type="button"
                              className={`ml-1 flex-shrink-0 rounded-full p-1 text-lg ${isExcluded(facet, item.key)
                                ? 'text-accent-700 bg-accent-50 outline outline-1 outline-accent-700'
                                : 'text-neutral-700 hover:text-accent-700 hover:bg-accent-50'
                                }`}
                              aria-label={`${isExcluded(facet, item.key) ? 'Fjern utestenging av' : 'Utesteng'} ${renderLabel(facet, item.key)}`}
                              aria-pressed={isExcluded(facet, item.key)}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleExclude(facet, item.key);
                              }}
                            >
                              <PiProhibit aria-hidden={true} />
                            </button>
                          </div>
                        </li>
                      )
                    })
                    : <li>
                      <div className="flex flex-col gap-6 my-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-neutral-900/10 rounded-md animate-pulse"></div>
                            <div style={{ width: getSkeletonLength(index, 8, 16) + 'rem' }} className="h-4 bg-neutral-900/10 rounded-full animate-pulse"></div>
                            <div className="w-6 h-6 ml-auto bg-neutral-900/10 rounded-full animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                    </li>
                  }
                </ul>
              </fieldset>
              : <div role="status" aria-live="polite" className='px-2 p-2'>Ingen treff</div>
            }
          </div>}
      </div>
    </>)

}