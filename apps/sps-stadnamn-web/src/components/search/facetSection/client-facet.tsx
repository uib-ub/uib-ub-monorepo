import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useQueryWithout, useQueryStringWithout, useDataset, useSearchQuery } from '@/lib/search-params';
import { PiTrashFill, PiSortAscending, PiSortDescending, PiFunnelSimple, PiFunnel } from 'react-icons/pi';
import IconButton from '@/components/ui/icon-button';



export default function ClientFacet({ showLoading, facetName }: { showLoading: (facet: string | null) => void, facetName: string }) {
  const router = useRouter()
  const dataset = useDataset()
  const [facetSearchQuery, setFacetSearchQuery] = useState('');
  //const paramsExceptFacet = useQueryStringWithout(['docs', 'view', 'manifest', facetName, 'page', 'size', 'sort', 'orderBy', 'dataset']);
  const { searchQuery } = useSearchQuery()
  // Without facetName
  const paramsExceptFacet = searchQuery.toString().replace('&' + facetName, '')
  

  const paramLookup = useSearchParams()
  const searchParams = useQueryWithout(['docs', 'view', 'manifest', 'page'])
  const [facetAggregation, setFacetAggregation] = useState<any | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [sortMode, setSortMode] = useState<'doc_count' | 'asc' | 'desc'>('doc_count');
  const clearedFilters = useQueryStringWithout([facetName, 'page'])

  // Will for instance include "Hordaland" in addition to "Hordaland_Bergen" if the latter is checked
  const expandedFacets = new Set<string>();
  for (const [key, value] of paramLookup) {
    if (key != facetName) continue
    const path = value.split('__')
    for (let i = 0; i < path.length; i++) {
      expandedFacets.add(path.slice(i).join('__'))
    }
  }

  useEffect(() => {
    console.log("Q", `/api/facet?dataset=${dataset}&facets=adm1,adm2,adm3${paramsExceptFacet ? '&' + paramsExceptFacet : ''}`)
    fetch(`/api/facet?dataset=${dataset}&facets=adm1,adm2,adm3${paramsExceptFacet ? '&' + paramsExceptFacet : ''}`).then(response => response.json()).then(es_data => {
      setFacetAggregation(es_data.aggregations?.adm1)
      console.log("Facet aggregation", es_data.aggregations?.adm1)
      setTimeout(() => {
        showLoading(null);
      }, 200);
      setIsLoading(false);
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paramsExceptFacet, dataset]
    )

  const useClearFilter = () => {
    router.push("/")
  }


  const isChecked = (paramName: string, ownPath: string[]) => {
    if (paramLookup.has(facetName, ownPath.join('__'))) return true
    // Check if in expandedFacets
    if (expandedFacets.has(ownPath.join("__"))) return true
    return false
  }


  const toggleAdm = (beingChecked: boolean, paramName: string, chosenPath: string[]) => {
    const chosenValue = chosenPath.join('__')
    let hasSibling = false
    const newParams = searchParams.filter(urlParam => {
      if (urlParam[0] != paramName) return true // Ignore other params
      if (urlParam[1] == chosenValue) return false // remove self
      const urlPath = urlParam[1].split('__')

      // remove parents
      if (urlPath.length < chosenPath.length && chosenPath.slice(1).every((value, index) => value == urlPath[index])) return false
      
      if (!beingChecked) { // When unchecked
        // remove descendants
        if (chosenPath.length < urlPath.length && urlPath.slice(-chosenPath.length).every((value, index) => value == chosenPath[index])) return false
        
      // check if sibling is checked
        if (!hasSibling 
            && urlPath.length >= chosenPath.length 
            && chosenPath.slice(1).every((value, index) => value == urlPath[urlPath.length - chosenPath.length + 1 + index])) {
          hasSibling = true
        }
      }
      return true
    })
    if (beingChecked) {
      newParams.push([paramName, chosenValue]) // add self
    }
    else if (chosenPath.length > 1 && !hasSibling) { // add parent if no siblings checked
      newParams.push([paramName, chosenPath.slice(1).join('__')])
    }

    router.push(`/view/${dataset}?${new URLSearchParams(newParams).toString()}`)
  }

  const sortBuckets = (buckets: any) => {
    const orderCompare = (a: string, b: string) => {
      return sortMode === 'asc' ? a.localeCompare(b, 'nb') : b.localeCompare(a, 'nb'); 
    }
    return [...buckets].sort((a, b) => {
      if (sortMode === 'doc_count') {
        return parseInt(b.doc_count) - parseInt(a.doc_count);
      } else {
        if (a.label && b.label) {
          return orderCompare(a.label.buckets[0].key, b.label.buckets[0].key);
        }
        return orderCompare(a.key, b.key);
      }
    });
  };


  const facetSearch = (item: any, baseName: string, level: number): boolean => {
    if (!facetSearchQuery && level == 1) return true
    if (facetSearchQuery && item.key.toLowerCase().includes(facetSearchQuery)) return true
    const childLevel = level +1
    if (item[baseName + childLevel]?.buckets.some((subitem: any) => facetSearch(subitem, baseName, childLevel))) {
      return true
    } 
    return false
    
  };


  const listItem = (item: any, index: number, baseName: string, path: string[], parentChecked: boolean) => {
    const childAggregation = baseName + (path.length + 1);
    const checked = isChecked(baseName, path);
    const children = item[childAggregation]?.buckets
    const filteredChildren = facetSearchQuery && children?.filter((subitem: any) => facetSearch(subitem, baseName, path.length +1))

    return (
      <li key={item.key} className="my-0">
        <label>
          <input type="checkbox" checked={checked} onChange={(e) => { toggleAdm(e.target.checked, baseName, path)}} className='mr-2' />
          {item.key} <span className="bg-white border border-neutral-300 shadow-sm text-xs px-2 py-[1px] rounded-full">{item.doc_count}</span>
        </label>

      {children?.length && (checked || filteredChildren) ? 
      <ul className="flex flex-col ml-6 my-2 gap-2">
        {sortBuckets(filteredChildren || children).map((subitem, subindex) => {
          return listItem(subitem, subindex, baseName, [subitem.key, ...path], checked || parentChecked)
        })} 
      </ul> 
      : null}
      
      </li>

    )
  }



  return (
    <>
    { !isLoading &&
    <div className="flex flex-col gap-2 p-2 py-4 border-b border-neutral-300">
    <div className='flex gap-2'>
    <div className='relative grow'>
      <input onChange={(e) => setFacetSearchQuery(e.target.value.toLowerCase())} 
          className="pl-6 w-full border rounded-sm border-neutral-300 px-1"/>
      <span className="absolute left-1 top-1/2 transform -translate-y-1/2">
        <PiFunnel aria-hidden={true} className='text-neutral-900'/>
      </span>
    </div>
    
    {sortMode == 'doc_count' ?
      <IconButton className="text-xl" label="Sorter stigende" onClick={() => setSortMode('asc')}><PiSortAscending/></IconButton>
    : sortMode == 'asc' ?
      <IconButton className="text-xl" label="Sorter synkende" onClick={() => setSortMode('desc')}><PiSortDescending/></IconButton>
    :
      <IconButton className="text-xl" label="Sorter etter antall treff" onClick={() => setSortMode('doc_count')}><PiFunnelSimple/></IconButton>
    }
    {paramLookup.get(facetName) ?
      <IconButton type="button" label="Fjern områdefiltre" onClick={useClearFilter} className="icon-button ml-auto">
        <PiTrashFill className="text-xl text-neutral-800" aria-hidden="true"/>
      </IconButton>
      : null
    }
    </div>
    { facetAggregation?.buckets ?
    <ul className='flex flex-col gap-2 p-2 stable-scrollbar xl:overflow-y-auto xl:max-h-40 2xl:max-h-64 border rounded-sm bg-neutral-50 border-neutral-300'>
      {sortBuckets(facetAggregation?.buckets).filter(item => facetSearch(item, facetName, 1)).map((item, index) => (
        listItem(item, index, facetName, [item.key], false)
      ))}

    </ul>
    : <></>
    }
    </div>
  } </>)

}