import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams, useParams } from 'next/navigation';
import { useQueryStringWithout, useDataset, useSearchQuery } from '@/lib/search-params';
import { facetConfig } from '@/config/search-config';
import { PiSortAscending, PiSortDescending, PiFunnelSimple, PiMagnifyingGlass, PiFloppyDisk, PiPushPinFill, PiPushPin, PiPushPinSlash } from 'react-icons/pi';
import IconButton from '@/components/ui/icon-button';
import { datasetTitles } from '@/config/metadata-config';
import { useQueryState } from 'nuqs';


export default function ServerFacet({ showLoading }: { showLoading: (facet: string | null) => void }) {
  const router = useRouter()
  const dataset = useDataset()
  const searchParams = useSearchParams()
  const { searchQueryString, removeFilterParams } = useSearchQuery()
  const [facetAggregation, setFacetAggregation] = useState<any | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  
  const [facetSearch, setFacetSearch] = useState('');
  

  const availableFacets = facetConfig[dataset]
  const [selectedFacet, setSelectedFacet] = useQueryState('selectedFacet', {defaultValue: availableFacets && availableFacets[0]?.key});
  const [sortMode, setSortMode] = useState<'doc_count' | 'asc' | 'desc'>(availableFacets && availableFacets[0]?.sort || 'doc_count');
  const paramsExceptFacet = removeFilterParams(selectedFacet)

  const switchFacet = (facet: string) => {
    setSelectedFacet(facet)
    setSortMode(facetConfig[dataset].find(item => item.key == facet)?.sort || 'doc_count')
  }

  const renderLabel = (key: string, label: string) => {
    if (key == 'dataset') return datasetTitles[label]
    return label
  }

  const toggleFilter = (beingChecked: boolean, facet: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Remove existing value if present
    const existingValues = params.getAll(facet);
    params.delete(facet);
    
    // Add back all values except the one we're toggling
    existingValues
      .filter(v => v !== value)
      .forEach(v => params.append(facet, v));
    
    // Add the value if being checked
    if (beingChecked) {
      params.append(facet, value);
    }
  
    // Ensure nav and facet params are present
    params.set('nav', 'filters');
    params.set('facet', 'other');
  
    router.push(`?${params.toString()}`, { scroll: false });
  };
    

  useEffect(() => {
    fetch(`/api/facet?dataset=${dataset}&facets=${selectedFacet}${
      facetSearch ? '&facetSearch=' + facetSearch + "*" : ''}${
        paramsExceptFacet ? '&' + paramsExceptFacet : ''}${
          sortMode != 'doc_count' ? '&facetSort=' + sortMode : ''}`).then(response => response.json()).then(es_data => {
      
      // if selectedfacet is nested with __
      if (selectedFacet.includes('__')) {
        const [parent, child] = selectedFacet.split('__')
        setFacetAggregation(es_data.aggregations?.[parent]?.[child])
      }
      else {
        setFacetAggregation(es_data.aggregations?.[selectedFacet])
      }

      
      setTimeout(() => {
        showLoading(null);
      }, 200);
      setIsLoading(false);
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paramsExceptFacet, dataset, selectedFacet, facetSearch, sortMode]
    )




  return (
    <>
    { !isLoading &&
    <div className="flex flex-col gap-2 border-b border-neutral-300 py-4">
    <div className='flex flex-col xl:flex-row gap-2'>
    <select onChange={(e) => switchFacet(e.target.value)}>
        {availableFacets?.map((item, index) => (
            <option key={index} value={item.key}>{renderLabel(item.key, item.label)}</option>
        ))}
    </select>
    <div className='flex gap-2'>
    <div className='relative grow'>
      <input onChange={(e) => setFacetSearch(e.target.value)} 
          className="pl-6 w-full border rounded-sm border-neutral-300 px-1 grow"/>
      <span className="absolute left-1 top-1/2 transform -translate-y-1/2">
        <PiMagnifyingGlass aria-hidden={true} className='text-neutral-900'/>
      </span>
    </div>

    {sortMode == 'doc_count' ?
    <IconButton className="text-xl" label="Sorter stigende" onClick={() => setSortMode('asc')}><PiSortAscending/></IconButton>
    : sortMode == 'asc' ?
    <IconButton className="text-xl" label="Sorter synkende" onClick={() => setSortMode('desc')}><PiSortDescending/></IconButton>
    : 
    <IconButton className="text-xl" label="Sorter etter antall treff" onClick={() => setSortMode('doc_count')}><PiFunnelSimple/></IconButton>
    }
    <IconButton className="text-xl" label="Fest filtrering" onClick={() => setSortMode('doc_count')}><PiPushPin/></IconButton>
    </div>
    </div>
    { facetAggregation?.buckets.length ?
    <ul role="status" aria-live="polite" className='flex flex-col gap-2 px-2 p-2 stable-scrollbar xl:overflow-y-auto xl:max-h-40 2xl:max-h-64 border rounded-sm bg-neutral-50 border-neutral-300'>
      {facetAggregation?.buckets.map((item: any, index: number) => (
        <li key={index}>
        <label>
          <input type="checkbox" checked={searchParams.getAll(selectedFacet).includes(item.key.toString()) ? true : false} className='mr-2' name={selectedFacet} value={item.key} onChange={(e) => { toggleFilter(e.target.checked, e.target.name, e.target.value) }}/>
          {item.key} <span className="bg-white border border-neutral-300 shadow-sm text-xs px-2 py-[1px] rounded-full">{item.doc_count}</span>
        </label>
        </li>
        ))}

    </ul>
    : <div role="status" aria-live="polite" className='px-2 p-2 rounded-sm bg-neutral-50 border border-neutral-300'>Ingen treff</div>
    }
    </div>
  } </>)

}