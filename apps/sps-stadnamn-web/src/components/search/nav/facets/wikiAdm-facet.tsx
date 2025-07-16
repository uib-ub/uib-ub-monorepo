import { useState, useEffect, useContext } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSearchQuery, useDataset } from '@/lib/search-params';
import { PiMagnifyingGlass, PiCaretDownBold, PiCaretUpBold } from 'react-icons/pi';
import FacetToolbar from './facet-toolbar';
import { GlobalContext } from '@/app/global-provider';
import IconButton from '@/components/ui/icon-button';

export default function WikiAdmFacet() {
  const router = useRouter()
  const dataset = useDataset()
  const { removeFilterParams } = useSearchQuery()
  const [facetSearchQuery, setFacetSearchQuery] = useState('');
  const facetName = 'wikiAdm'
  const paramsExceptFacet = removeFilterParams([facetName, 'adm1', 'adm2'])
  const [facetAggregation, setFacetAggregation] = useState<any | undefined>(undefined);
  const searchParams = useSearchParams()
  const [facetIsLoading, setFacetIsLoading] = useState<boolean>(true);
  const { facetOptions, updatePinnedFilters, pinnedFilters } = useContext(GlobalContext)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/wikiAdm${facetSearchQuery ? `?facetQuery=${facetSearchQuery}` : ''}${
      paramsExceptFacet ? `${facetSearchQuery ? '&' : '?'}${paramsExceptFacet}` : ''}`
    ).then(response => response.json()).then(es_data => {
      setFacetAggregation(es_data.aggregations?.by_wiki)
      setFacetIsLoading(false);
    })
  }, [facetSearchQuery, paramsExceptFacet])

  const toggleExpanded = (itemKey: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey);
      } else {
        newSet.add(itemKey);
      }
      return newSet;
    });
  };

  const isChecked = (paramName: string, value: string) => {
    return searchParams.has(paramName, value);
  }

  const toggleFilter = (beingChecked: boolean, paramName: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Remove existing value if present
    params.delete(paramName);
    params.delete('page');
    params.delete('parent');
    params.delete('zoom');
    params.delete('center');
    params.delete('doc');
    params.delete('group');

    // Add the value if being checked
    if (beingChecked) {
      params.append(paramName, value);
    }

    if (facetOptions[dataset]?.[paramName]?.pinningActive) {
      updatePinnedFilters(beingChecked ? [...pinnedFilters[dataset], [paramName, value]] 
          : pinnedFilters[dataset]?.filter(([k, v]) => (k == paramName && v == value) ? false : true))
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const toggleCombinedFilter = (beingChecked: boolean, wikiId: string, adm1Value: string, adm2Value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Remove navigation-related params
    params.delete('page');
    params.delete('parent');
    params.delete('zoom');
    params.delete('center');
    params.delete('doc');
    params.delete('group');

    // Get all current values
    const currentWikiAdm = params.getAll('wikiAdm');
    const currentAdm1 = params.getAll('adm1');
    const currentAdm2 = params.getAll('adm2');

    // Remove all values temporarily
    params.delete('wikiAdm');
    params.delete('adm1');
    params.delete('adm2');

    if (beingChecked) {
      // Add back existing values
      currentWikiAdm.forEach((value, index) => {
        // Only add back if it's not the same wikiId we're adding
        if (value !== wikiId) {
          params.append('wikiAdm', value);
          params.append('adm1', currentAdm1[index]);
          if (currentAdm2[index]) {
            params.append('adm2', currentAdm2[index]);
          }
        }
      });

      // Add the new combination
      params.append('wikiAdm', wikiId);
      params.append('adm1', adm1Value);
      if (adm2Value) {
        params.append('adm2', adm2Value);
      }
    } else {
      // Add back all values except the one we're removing
      currentWikiAdm.forEach((value, index) => {
        if (value !== wikiId || 
            currentAdm1[index] !== adm1Value || 
            (adm2Value && currentAdm2[index] !== adm2Value)) {
          params.append('wikiAdm', value);
          params.append('adm1', currentAdm1[index]);
          if (currentAdm2[index]) {
            params.append('adm2', currentAdm2[index]);
          }
        }
      });
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  const getFirstPath = (bucket: any) => {
    const adm1 = bucket.adm1?.buckets[0];
    if (!adm1) return '';
    const adm2 = adm1.adm2?.buckets[0];
    return adm2 ? `${adm2.key}, ${adm1.key}` : adm1.key;
  };

  const getAllPaths = (bucket: any) => {
    const paths: string[] = [];
    bucket.adm1?.buckets.forEach((adm1: any) => {
      adm1.adm2?.buckets.forEach((adm2: any) => {
        paths.push(`${adm2.key}, ${adm1.key}`);
      });
    });
    return paths;
  };

  const getSkeletonLength = (index: number, min: number, max: number) => {
    if (index === 0) return min;
    if (index === 1) return max;
    return min + (max - min) * (index - 1) / 2;
  };

  return (
    <div className="flex flex-col gap-2 py-2">
      {/* Search input and toolbar */}
      <div className='flex gap-2'>
        <div className='relative grow'>
          <input 
            aria-label="Søk i områdefilter" 
            onChange={(e) => setFacetSearchQuery(e.target.value.toLowerCase())}
            className="pl-8 w-full border rounded-md border-neutral-300 p-1"
          />
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2">
            <PiMagnifyingGlass aria-hidden={true} className='text-neutral-500 text-xl'/>
          </span>
        </div>
        <FacetToolbar/>
      </div>
      
      {facetAggregation?.buckets ? (
        <fieldset>
          <legend className="sr-only">Filtreringsalternativer for områdeinndeling</legend>
          <ul role="status" aria-live="polite" className='flex flex-col px-2 divide-y divide-neutral-200'>
            {facetAggregation.buckets.map((item: any) => {
              const isExpanded = expandedItems.has(item.key);
              const firstPath = getFirstPath(item);
              const allPaths = getAllPaths(item);

              return (
                <li key={item.key} className="py-2">
                  <div className="flex items-start gap-2">
                    <label className="flex items-center gap-2 flex-1">
                      <input 
                        type="checkbox" 
                        checked={isChecked(facetName, item.key) && 
                          // Add check for the specific adm1/adm2 values of the first path
                          searchParams.has('adm1', item.adm1?.buckets[0]?.key) &&
                          searchParams.has('adm2', item.adm1?.buckets[0]?.adm2?.buckets[0]?.key)}
                        onChange={(e) => toggleCombinedFilter(
                          e.target.checked,
                          item.key,
                          item.adm1?.buckets[0]?.key,
                          item.adm1?.buckets[0]?.adm2?.buckets[0]?.key
                        )}
                        className="mr-2" 
                      />
                      <span className="text-neutral-950 break-words lg:text-sm xl:text-base">
                        {firstPath}
                        <span className="ml-2 bg-white border border-neutral-300 shadow-sm text-xs px-2 py-[1px] rounded-full align-baseline">
                          {item.doc_count.toLocaleString('nb-NO')}
                        </span>
                      </span>
                    </label>
                    {allPaths.length > 1 && (
                      <IconButton
                        label={`${isExpanded ? 'Skjul' : 'Vis'} varianter`}
                        onClick={() => toggleExpanded(item.key)}
                        className="rounded-full btn btn-outline btn-compact p-1"
                      >
                        {isExpanded ? <PiCaretUpBold className="w-4 h-4" /> : <PiCaretDownBold className="w-4 h-4" />}
                      </IconButton>
                    )}
                  </div>
                  {isExpanded && allPaths.length > 1 && (
                    <div className="ml-6 mt-2 border-l-2 border-neutral-200 pl-4 mb-4">
                      {item.adm1?.buckets.map((adm1: any) => {
                        // Find the highest doc_count in this adm1 group
                        const maxDocCount = Math.max(...adm1.adm2?.buckets.map((b: any) => b.doc_count) || [0]);
                        
                        return adm1.adm2?.buckets.map((adm2: any) => {
                          const path = `${adm2.key}, ${adm1.key}`;
                          const isOverlapping = Array.isArray(adm2.top_hit?.hits?.hits) && 
                            adm2.top_hit?.hits?.hits.slice(0, 2).every((hit: any) => 
                              Array.isArray(hit._source?.wikiAdm) && 
                              hit._source?.wikiAdm.length > 1
                            );
                          
                          // Only show if not overlapping or if it has the highest doc_count in its adm1
                          if (!isOverlapping || adm2.doc_count === maxDocCount) {
                            return (
                              <div key={`${adm1.key}-${adm2.key}`} className="py-1">
                                <label className="flex items-center gap-2">
                                  <input 
                                    type="checkbox" 
                                    checked={searchParams.has('wikiAdm', item.key) && 
                                            searchParams.has('adm1', adm1.key) && 
                                            searchParams.has('adm2', adm2.key)}
                                    onChange={(e) => toggleCombinedFilter(e.target.checked, item.key, adm1.key, adm2.key)}
                                    className="mr-2" 
                                  />
                                  <span className="text-neutral-950">
                                    {path}
                                    <span className="ml-2 bg-white border border-neutral-300 shadow-sm text-xs px-2 py-[1px] rounded-full align-baseline">
                                      {adm2.doc_count.toLocaleString('nb-NO')}
                                    </span>
                                    {isOverlapping && (
                                      <em className="ml-2 uppercase font-semibold text-neutral-700">
                                        Overlapp
                                      </em>
                                    )}
                                  </span>
                                </label>
                              </div>
                            );
                          }
                          return null;
                        });
                      })}
                      <a 
                        href={`https://www.wikidata.org/wiki/${item.key}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-2"
                      >
                        Samordna med wikidata: {item.key}
                      </a>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </fieldset>
      ) : facetIsLoading ? (
        <div className="flex flex-col gap-6 my-3">
          {Array.from({length: 6}).map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-4 h-4 bg-neutral-900/10 rounded-md animate-pulse"></div>
              <div style={{width: getSkeletonLength(index, 8, 16) + 'rem'}} className="h-4 bg-neutral-900/10 rounded-full animate-pulse"></div>
              <div className="w-6 h-6 ml-auto bg-neutral-900/10 rounded-full animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : (
        <div role="status" aria-live="polite" className='px-2 p-2'>Ingen treff</div>
      )}
    </div>
  );
}