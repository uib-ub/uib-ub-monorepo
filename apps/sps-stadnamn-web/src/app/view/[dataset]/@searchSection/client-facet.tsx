import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams, useParams } from 'next/navigation';
import { useQueryWithout, useQueryStringWithout } from '@/lib/search-params';
import { PiTrashFill, PiSortAscending, PiSortDescending } from 'react-icons/pi';
import IconButton from '@/components/ui/icon-button';



export default function ClientFacet({ setFilterStatus, facetName }: { setFilterStatus: (status: string) => void, facetName: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const [sortMethod, setSortMethod] = useState('key');
  const [facetSearchQuery, setFacetSearchQuery] = useState('');
  const facetQuery = useQueryStringWithout(['docs', 'view', 'manifest', facetName, 'page', 'size', 'sort']);
  const paramLookup = useSearchParams()
  const searchParams = useQueryWithout(['docs', 'view', 'manifest', 'page'])
  const [facetAggregation, setFacetAggregation] = useState<any | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const clearedFilters = useQueryStringWithout([facetName, 'page'])

  // Will for instance include "Hordaland" in addition to "Hordaland_Bergen" if the latter is checked
  const expandedFacets = new Set<string>();
  for (const [key, value] of paramLookup) {
    if (key != facetName) continue
    const path = value.split('_')
    for (let i = 0; i < path.length; i++) {
      expandedFacets.add(path.slice(i).join('_'))
    }
  }

  useEffect(() => {
    setFilterStatus('loading');
    fetch(`/api/facet?dataset=${params.dataset}&facets=adm1,adm2,adm3${facetQuery ? '&' + facetQuery : ''}`).then(response => response.json()).then(es_data => {
      setFacetAggregation(es_data.aggregations?.adm1)
      setTimeout(() => {
        setFilterStatus('expanded');
      }, 200);
      setIsLoading(false);
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [facetQuery, params.dataset]
    )

  const useClearFilter = () => {
    router.push(pathname + '?' + clearedFilters, { scroll: false})
  }

  const handleSortOrderChange = () => {
    setSortOrder(prevSortOrder => prevSortOrder === 'asc' ? 'desc' : 'asc');
  };

  const isChecked = (paramName: string, ownPath: string[]) => {
    if (paramLookup.has(facetName, ownPath.join("_"))) return true
    // Check if in expandedFacets
    if (expandedFacets.has(ownPath.join("_"))) return true
    return false
  }


  const toggleAdm = (beingChecked: boolean, paramName: string, chosenPath: string[]) => {
    const chosenValue = chosenPath.join('_')
    let hasSibling = false
    const newParams = searchParams.filter(urlParam => {
      if (urlParam[0] != paramName) return true // Ignore other params
      if (urlParam[1] == chosenValue) return false // remove self
      const urlPath = urlParam[1].split('_')

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
      newParams.push([paramName, chosenPath.slice(1).join('_')])
    }

    router.push(pathname + "?" + new URLSearchParams(newParams).toString())
  }



  const sortBuckets = (buckets: any) => {
    const orderCompare = (a: string, b: string) => {
    return sortOrder === 'asc' ? a.localeCompare(b, 'nb') : b.localeCompare(a, 'nb'); 
    }
    return [...buckets].sort((a, b) => {
      if (sortMethod === 'doc_count') {
        const difference = parseInt(b.doc_count) - parseInt(a.doc_count)
        return sortOrder === 'asc' ? difference : -difference
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
    <div className="flex flex-col gap-4 p-2 border-b border-neutral-300 pb-4">
    <div className='flex gap-2'>
      <input onChange={(e) => setFacetSearchQuery(e.target.value.toLowerCase())} className="bg-neutral-50 border rounded-sm border-neutral-300 grow"></input>
    <select onChange={(e) => setSortMethod(e.target.value)}>
        <option value="key">alfabetisk</option>
        <option value="doc_count">antall treff</option>
    </select>
    <IconButton className="text-xl" label={sortOrder == 'asc' ? 'Sorter stigende': 'Sorter synkende'} onClick={handleSortOrderChange}>{sortOrder == 'asc' ? <PiSortDescending/>: <PiSortAscending/> }</IconButton>
    {paramLookup.get(facetName) ?
    <IconButton type="button" label="Fjern områdefiltre" onClick={useClearFilter} className="icon-button ml-auto">
      <PiTrashFill className="text-xl text-neutral-800" aria-hidden="true"/>
    </IconButton>
    : null
    }
    </div>
    { facetAggregation?.buckets ?
    <ul className='flex flex-col gap-2 px-2 py-1 stable-scrollbar xl:overflow-y-auto xl:max-h-40 2xl:max-h-64 border rounded-sm bg-neutral-50 border-neutral-300'>
      {sortBuckets(facetAggregation?.buckets).filter(item => facetSearch(item, facetName, 1)).map((item, index) => (
        listItem(item, index, facetName, [item.key], false)
      ))}

    </ul>
    : <></>
    }
    </div>
  } </>)

}