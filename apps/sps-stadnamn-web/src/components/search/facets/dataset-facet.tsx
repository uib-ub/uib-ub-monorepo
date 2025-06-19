import { useState, useEffect, useContext, ChangeEvent, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDataset, useSearchQuery } from '@/lib/search-params';
import { facetConfig, fieldConfig } from '@/config/search-config';
import { PiMagnifyingGlass, PiInfo, PiInfoFill, PiCaretDown, PiCaretRight } from 'react-icons/pi';

import { datasetTitles, typeNames, datasetTypes, datasetDescriptions, datasetShortDescriptions } from '@/config/metadata-config';

import FacetToolbar from './facet-toolbar';
import { GlobalContext } from '@/app/global-provider';
import { getSkeletonLength } from '@/lib/utils';
import { SearchContext } from '@/app/search-provider';
import IconButton from '@/components/ui/icon-button';
import Link from 'next/link';


export default function DatasetFacet() {
  const router = useRouter()
  const dataset = useDataset()
  const searchParams = useSearchParams()
  const { removeFilterParams } = useSearchQuery()
  const [facetAggregation, setFacetAggregation] = useState<any | undefined>(undefined);
  const [facetLoading, setFacetLoading] = useState(true);
  const [facetSearch, setFacetSearch] = useState('');
  const [clientSearch, setClientSearch] = useState(''); // For fields that have labels defined in the config files
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  const {facetOptions, pinnedFilters, updatePinnedFilters } = useContext(GlobalContext)
  const availableFacets = useMemo(() => facetConfig[dataset], [dataset]);
  const [sortMode, setSortMode] = useState<'doc_count' | 'asc' | 'desc'>(availableFacets && availableFacets[0]?.sort || 'doc_count');
  const paramsExceptFacet = removeFilterParams('indexDataset') || searchParams.toString()

  useEffect(() => {

    // Fetch data only if we have a valid facet
    fetch(`/api/facet?facets=indexDataset${
      facetSearch ? '&facetSearch=' + facetSearch + "*" : ''}${
        paramsExceptFacet ? '&' + paramsExceptFacet : ''}${
          sortMode != 'doc_count' ? '&facetSort=' + sortMode : ''}`).then(response => response.json()).then(es_data => {
      
      setFacetAggregation(es_data.aggregations?.indexDataset)

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
    params.delete('indexDataset');

    // reset because different markers should be shown
    params.delete('parent')
    params.delete('zoom')
    params.delete('center')
    params.delete('doc')
    
    // For indexDataset, convert all values to dataset tags before filtering
    
    const currentValue = value.split('-')[2];
    existingValues
    .filter(v => v !== currentValue)
    .forEach(v => params.append(facet, v));
    

    // Add the value if being checked
    if (beingChecked) {
      
        const datasetId = value.split('-')[2];
        params.append(facet, datasetId);

    }

    if (facetOptions[dataset]?.[facet]?.pinningActive) {
      updatePinnedFilters(beingChecked ? [...pinnedFilters[dataset], [facet, value]] 
          : pinnedFilters[dataset]?.filter(([k, v]) => (k == facet && v == value) ? false : true))
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };
    

  const filterDatasetsByTags = (item: any) => {
    if (searchParams.getAll('datasetTag').length > 0) {
      // Check if the dataset (item.key) has all the required dataset tags
      return searchParams.getAll('datasetTag').some(tag => 
        datasetTypes[item.key.split('-')[2]]?.includes(tag)
      );
    }
    return true;
  };

  const isChecked = (itemKey: string) => {
    const existingValues = searchParams.getAll('indexDataset');
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
    <div className="flex flex-col gap-2 pb-4">
    <div className='flex flex-col gap-2'>
    {dataset == 'all' && 
        <label className="flex items-center gap-2 px-2 border border-neutral-200 rounded-md py-1 px-2">
          <input
            type="checkbox"
            checked={searchParams.getAll('datasetTag').includes('collection')}
            onChange={(e) => {
              setClientSearch('');
              const params = new URLSearchParams(searchParams.toString());
              const existingTags = params.getAll('datasetTag');
              const existingDatasets = params.getAll('indexDataset');
              existingDatasets.filter(dataset => !datasetTypes[dataset]?.includes('collection')).forEach(dataset => params.delete('indexDataset', dataset));
              if (e.target.checked && !existingTags.includes('collection')) {
                params.append('datasetTag', 'collection');
              } else if (!e.target.checked) {
                params.delete('datasetTag');
                existingTags.filter(tag => tag !== 'collection').forEach(tag => params.append('datasetTag', tag));
              }
              router.push(`?${params.toString()}`, { scroll: false });
            }}
            className="form-checkbox"
          />
          
          <span>Stadnamninnsamlingar</span>
        </label>
    }
    <div className='flex gap-2'>
    <div className='relative grow'>
      <input aria-label="Søk i fasett" onChange={(e) => setClientSearch(e.target.value)}
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
      <legend className="sr-only">Filtreringsalternativer for datasett</legend>
      <ul role="status" aria-live="polite" className='flex flex-col px-2 divide-y divide-neutral-200 xl:overflow-y-auto'>
        {facetAggregation?.buckets.length ? facetAggregation?.buckets
          .filter(filterDatasetsByTags)
          .map((item: any) => {
            const label = renderLabel(item.key)
            const regex = new RegExp(`(^|\\s)${clientSearch.replace(/[*.+?^${}()|[\]\\]/g, '\\$&')}`, 'iu')
            const titleMatch = clientSearch?.length && regex.test(label)
            let descriptionMatch = null
            if (!titleMatch && clientSearch?.length) {
                descriptionMatch = regex.test(datasetShortDescriptions[item.key.split('-')[2]])
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
                <div className='flex items-start gap-2'>
                  <label className='flex items-center gap-2 flex-1'>
                    <input 
                      type="checkbox" 
                      checked={isChecked(item.key)} 
                      className='mr-2' 
                      name='indexDataset' 
                      value={item.key} 
                      onChange={(e) => { toggleFilter(e.target.checked, e.target.name, e.target.value) }}
                    />
                    <span className='font-semibold text-neutral-950'>{renderLabel(item.key)}</span> 
                    <span className="bg-white border border-neutral-300 shadow-sm text-xs px-2 py-[1px] rounded-full">{item.doc_count.toLocaleString('nb-NO', { useGrouping: true })}</span>
                  </label>
                  <IconButton
                    label={`${isExpanded ? 'Skjul' : 'Vis'} beskrivelse for ${renderLabel(item.key)}`}
                    onClick={() => toggleDescription(item.key)}
                    className="rounded-full btn btn-outline btn-compact p-1"
                    aria-label={`${isExpanded ? 'Skjul' : 'Vis'} beskrivelse for ${renderLabel(item.key)}`}
                  >
                    <PiCaretDown className="w-4 h-4" />
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
                        Les meir <PiCaretRight className="text-lg text-primary-600" />
                      </Link>
                    </div>
                  </div>
                )}
              </li>
            )
          }
          })
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
    : <div role="status" aria-live="polite" className='px-2 p-2'>Ingen treff</div>
    }
    </div>
   </>)

}