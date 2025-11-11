import { useState, useEffect, useContext, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSearchQuery } from '@/lib/search-params';
import { facetConfig } from '@/config/search-config';
import { PiMagnifyingGlass, PiCaretRight, PiCaretDownBold, PiTreeViewFill, PiTreeViewLight, PiDatabaseLight, PiDatabaseFill, PiMicroscopeFill, PiMicroscopeLight, PiCircleFill, PiCircleLight, PiListFill, PiListLight, PiStack, PiStackLight, PiStackFill, PiWallFill, PiWallLight, PiCaretUpBold, PiCaretRightBold } from 'react-icons/pi';

import { datasetTitles, datasetShortDescriptions } from '@/config/metadata-config';

import FacetToolbar from './facet-toolbar';
import { GlobalContext } from '@/state/providers/global-provider';
import { formatNumber, getSkeletonLength } from '@/lib/utils';
import IconButton from '@/components/ui/icon-button';
import Link from 'next/link';
import Clickable from '@/components/ui/clickable/clickable';
import { usePerspective } from '@/lib/param-hooks';
import { FacetBadge } from '@/components/ui/badge';
import { treeSettings } from '@/config/server-config';

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


export default function DatasetFacet() {
  const router = useRouter()
  const perspective = usePerspective()
  const searchParams = useSearchParams()
  const { removeFilterParams } = useSearchQuery()
  const [facetAggregation, setFacetAggregation] = useState<any | undefined>(undefined);
  const [facetLoading, setFacetLoading] = useState(true);
  const [facetSearch, setFacetSearch] = useState('');
  const [clientSearch, setClientSearch] = useState(''); // For fields that have labels defined in the config files
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  const availableFacets = useMemo(() => facetConfig[perspective], [perspective]);
  const [sortMode, setSortMode] = useState<'doc_count' | 'asc' | 'desc'>(availableFacets && availableFacets[0]?.sort || 'doc_count');
  const paramsExceptFacet = removeFilterParams('dataset')
  const datasetTag = searchParams.get('datasetTag')
  const isCadastral = searchParams.get('datasetTag') == 'tree'

  useEffect(() => {

    // Fetch data only if we have a valid facet
    fetch(`/api/facet?perspective=all&facets=dataset${
      facetSearch ? '&facetSearch=' + facetSearch + "*" : ''}${
        paramsExceptFacet ? '&' + paramsExceptFacet : ''}${
          sortMode != 'doc_count' ? '&facetSort=' + sortMode : ''}`).then(response => response.json()).then(es_data => {
      
      setFacetAggregation(es_data.aggregations?.dataset)

      setFacetLoading(false);
    })
  }, [availableFacets, paramsExceptFacet, facetSearch, sortMode])


  const renderLabel = (label: string) => {
    return  datasetTitles[label.split('-')[2]]
  }

  const toggleFilter = (beingChecked: boolean, facet: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Remove existing value if present
    const existingValues = params.getAll(facet);
    params.delete('dataset');

    params.delete('page')

    // reset because different markers should be shown
    params.delete('parent')
    params.delete('zoom')
    params.delete('center')
    params.delete('doc')
    params.delete('group')
    params.delete('init')
    
    // For dataset, convert all values to dataset tags before filtering
    
    const currentValue = value.split('-')[2];
    existingValues
    .filter(v => v !== currentValue)
    .forEach(v => params.append(facet, v));
    

    // Add the value if being checked
    if (beingChecked) {
      
        const datasetId = value.split('-')[2];
        params.append(facet, datasetId);

    }
    router.push(`?${params.toString()}`, { scroll: false });
  };
    



  const isChecked = (itemKey: string) => {
    const existingValues = searchParams.getAll('dataset');
    const datasetId = itemKey.split('-')[2];
    return existingValues.includes(datasetId);

  };

  const toggleDescription = (itemKey: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemKey)) {
        newSet.delete(itemKey);
      } else {
        newSet.add(itemKey);
      }
      return newSet;
    });
  };



  return (
    <>
    <div className="flex flex-col gap-2">            
    
    <div id="dataset-facet-content" className='flex flex-col gap-2'>

    {datasetTag != 'tree' && <div className='flex gap-2 px-2 pt-1'>
     <div className='relative grow'>
      <input aria-label="Søk i fasett" onChange={(e) => setClientSearch(e.target.value)}
          className="pl-8 w-full border rounded-md border-neutral-300 h-full px-2"/>
      <span className="absolute left-2 top-1/2 transform -translate-y-1/2">
        <PiMagnifyingGlass aria-hidden={true} className='text-neutral-500 text-xl'/>
      </span>
    </div>

    <FacetToolbar/>
    </div>}
    </div>
    

    { (facetLoading || facetAggregation?.buckets.length) ?
    <fieldset>
      <legend className="sr-only">Filtreringsalternativer for datasett</legend>
      <ul aria-live="polite" className='flex flex-col px-2 divide-y divide-neutral-200'>
        {facetAggregation?.buckets.length ? facetAggregation?.buckets
          .map((item: any) => {
            const label = renderLabel(item.key)

            if (isCadastral) {
              const dataset = item.key.split('-')[2]
              
              return {item, titleMatch: !!treeSettings[dataset]}
            }


            const regex = createSearchRegex(clientSearch);
            const titleMatch = clientSearch?.length && regex?.test(label)
            let descriptionMatch = null
            if (!titleMatch && clientSearch?.length) {
                descriptionMatch = regex?.test(datasetShortDescriptions[item.key.split('-')[2]])
            }
            return {item, titleMatch, descriptionMatch}
          })
          .sort((a: {titleMatch: boolean}, b: {titleMatch: boolean}) => {
            if (a.titleMatch && !b.titleMatch) return -1;
            if (!a.titleMatch && b.titleMatch) return 1;
            return 0; // Keep original order if both have the same titleMatch status
          })
          .map(({item, titleMatch, descriptionMatch}: {item: any, titleMatch: boolean, descriptionMatch: boolean}, index: number) =>  {
            
            if (!clientSearch?.length || descriptionMatch || titleMatch) {
                const isExpanded = expandedDescriptions.has(item.key);
                return  (
              <li key={index} className='py-2'>
                <div className='flex items-start gap-2 lg:gap-1 xl:gap-2'>
                  {isCadastral ? 
                  <Clickable link only={{datasetTag: 'tree', dataset: item.key.split('-')[2]}} className="flex items-center gap-2 lg:gap-1 xl:gap-2 flex-1 min-w-0 no-underline">
                  {renderLabel(item.key)}<PiCaretRightBold className="text-primary-700" aria-hidden="true"/>
                  </Clickable>
                  
                  :<label className="flex items-center gap-2 lg:gap-1 xl:gap-2 px-2 flex-1 min-w-0">
                    <input 
                      type="checkbox"
                      checked={isChecked(item.key)} 
                      className="mr-2 flex-shrink-0" 
                      name="dataset" 
                      value={item.key} 
                      onChange={(e) => { toggleFilter(e.target.checked, e.target.name, e.target.value) }}
                    />
                    {/* --- Label and badge, last word grouping --- */}
                    {(() => {
                      const label = renderLabel(item.key) || '';
                      const words = label.split(' ');
                      const lastWord = words.pop();
                      const firstPart = words.join(' ');

                      return (
                        <span className="text-neutral-950 break-words lg:text-sm xl:text-base min-w-0">
                          {firstPart ? (
                            <>
                              {firstPart + ' '}
                              <span className="whitespace-nowrap">
                                {lastWord}
                                <FacetBadge count={item.doc_count} />

                              </span>
                            </>
                          ) : (
                            <>
                              {lastWord}
                              <FacetBadge count={item.doc_count} />
                            </>
                          )}
                        </span>
                      );
                    })()}
                  </label>}
                  <IconButton
                    label={`${isExpanded ? 'Skjul' : 'Vis'} beskrivelse`}
                    onClick={() => toggleDescription(item.key)}
                    className="rounded-full btn btn-outline btn-compact p-1 flex-shrink-0"
                    aria-label={`${isExpanded ? 'Skjul' : 'Vis'} beskrivelse`}
                  >
                    {isExpanded ? <PiCaretUpBold className="w-4 h-4" /> : <PiCaretDownBold className="w-4 h-4" />}
                  </IconButton>
                </div>
                {isExpanded && (
                  <div className='mt-2 ml-6 mb-2'>
                    {datasetShortDescriptions[item.key.split('-')[2]]}
                    <div className="flex mt-2">
                      <Link
                        href={`info/datasets/${item.key.split('-')[2]}`}
                        className="flex items-center gap-1 no-underline"
                      >
                        Les meir <PiCaretRight className="xl:text-lg text-primary-700" />
                      </Link>
                    </div>
                  </div>
                )}
              </li>
            )
          }
          })
          : <li>
              <div className="flex flex-col gap-6 my-3">
                {Array.from({length: 6}).map((_, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-neutral-900/10 rounded-md animate-pulse"></div>
                    <div style={{width: getSkeletonLength(index, 8, 16) + 'rem'}} className="h-4 bg-neutral-900/10 rounded-full animate-pulse"></div>
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
    </div>
   </>)

}