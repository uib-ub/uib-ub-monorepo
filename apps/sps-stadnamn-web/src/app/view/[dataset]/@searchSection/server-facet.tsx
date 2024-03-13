import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams, useParams } from 'next/navigation';
import { useQueryWithout, useQueryStringWithout } from '@/lib/search-params';
import { facetConfig } from '@/config/client-config';



export default function ServerFacet({ showLoading }: { showLoading: (facet: string | null) => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams<Record<string, string>>()
  const paramLookup = useSearchParams()
  const searchParams = useQueryWithout(['docs', 'view', 'manifest', 'page'])
  const [facetAggregation, setFacetAggregation] = useState<any | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [facetSearch, setFacetSearch] = useState('');
  

  const availableFacets = facetConfig[params.dataset]
  const [selectedFacet, setSelectedFacet] = useState(availableFacets[0].key);
  const paramsExceptFacet = useQueryStringWithout(['docs', 'view', 'manifest', 'page', 'size', 'sort', selectedFacet])

  const switchFacet = (facet: string) => {
    setSelectedFacet(facet)
  }

  const toggleFilter = (beingChecked: boolean, facet: string, value: string) => {
    const filteredParams = searchParams.filter(urlParam => !(urlParam[0] == facet && urlParam[1] == value))

    if (beingChecked) {
      if (filteredParams.length == searchParams.length) {
      searchParams.push([facet, value])
      }
      router.push(pathname + "?" + new URLSearchParams(searchParams).toString())
    }
    else {
        router.push(pathname + "?" + new URLSearchParams(filteredParams).toString())
    }
}
    

  useEffect(() => {
    fetch(`/api/facet?dataset=${params.dataset}&facets=${selectedFacet}${facetSearch ? '&facetSearch=' + facetSearch + "*" : ''}${paramsExceptFacet ? '&' + paramsExceptFacet : ''}`).then(response => response.json()).then(es_data => {
      setFacetAggregation(es_data.aggregations?.[selectedFacet])
      setTimeout(() => {
        showLoading(null);
      }, 200);
      setIsLoading(false);
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paramsExceptFacet, params.dataset, selectedFacet, facetSearch]
    )




  return (
    <>
    { !isLoading &&
    <div className="flex flex-col gap-4 p-2 border-b border-neutral-300 py-4">
    <div className='flex gap-2'>
    <select onChange={(e) => switchFacet(e.target.value)}>
        {availableFacets.map((item, index) => (
            <option key={index} value={item.key}>{item.label}</option>
        ))}
    </select>
    <input onChange={(e) => setFacetSearch(e.target.value)} className="bg-neutral-50 border rounded-sm border-neutral-300 grow"></input>
    </div>
    { facetAggregation?.buckets.length ?
    <ul role="status" aria-live="polite" className='flex flex-col gap-2 px-2 p-2 stable-scrollbar xl:overflow-y-auto xl:max-h-40 2xl:max-h-64 border rounded-sm bg-neutral-50 border-neutral-300'>
      {facetAggregation?.buckets.map((item: any, index: number) => (
        <li key={index}>
        <input type="checkbox" checked={paramLookup.getAll(selectedFacet).includes(item.key) ? true : false} className='mr-2' name={selectedFacet} value={item.key} onChange={(e) => { toggleFilter(e.target.checked, e.target.name, e.target.value) }}/>
        {item.key} <span className="bg-white border border-neutral-300 shadow-sm text-xs px-2 py-[1px] rounded-full">{item.doc_count}</span>
        </li>
        ))}

    </ul>
    : <div role="status" aria-live="polite" className='px-2 p-2 rounded-sm bg-neutral-50 border border-neutral-300'>Ingen treff</div>
    }
    </div>
  } </>)

}