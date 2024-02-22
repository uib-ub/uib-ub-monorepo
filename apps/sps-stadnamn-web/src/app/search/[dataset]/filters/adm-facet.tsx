import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams, useParams } from 'next/navigation';
import { useQueryWithout, useQueryStringWithout } from '@/lib/search-params';
import { PiTrashFill, PiSortAscending, PiSortDescending } from 'react-icons/pi';
import IconButton from '@/components/ui/icon-button';

interface BucketItem {
  key: string;
  doc_count: number;
  adm2?: {
    buckets: Array<BucketItem>;
  };
  adm3?: {
    buckets: Array<BucketItem>;
  };
}

interface FacetAggregation {
  buckets: Array<BucketItem>;
}


export default function AdmFacet({ setFilterStatus }: { setFilterStatus: (status: string) => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const [sortMethod, setSortMethod] = useState('key');
  const [filterSearch, setFilterSearch] = useState('');
  const facetQuery = useQueryStringWithout(['document', 'view', 'manifest', 'adm', 'page', 'size', 'sort']);
  const paramLookup = useSearchParams()
  const searchParams = useQueryWithout(['document', 'view', 'manifest', 'page'])
  const [facetAggregation, setFacetAggregation] = useState<FacetAggregation | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const clearedFilters = useQueryStringWithout(['adm', 'page'])

  useEffect(() => {
    setFilterStatus('loading');
    fetch(`/api/facet?dataset=${params.dataset}&${facetQuery}`).then(response => response.json()).then(es_data => {
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
    router.push(pathname + '?' + clearedFilters)
  }

  const handleSortOrderChange = () => {
    setSortOrder(prevSortOrder => prevSortOrder === 'asc' ? 'desc' : 'asc');
  };

  const isChecked = (paramName: string, ownPath: string[]) => {
    if (paramLookup.has('adm', ownPath.join("_"))) return true
    for (const [key, otherValue] of paramLookup) {
      if (key != paramName) continue

      const otherPath = otherValue.split('_')
      if (ownPath.length < otherPath.length && otherPath.slice(-ownPath.length).every((value, index) => value == ownPath[index])) return true


    }
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


  const includesFilter = (bucket: any): boolean => {
    if (bucket.key.toLowerCase().includes(filterSearch)) return true;
    if (bucket.adm2?.buckets.some(includesFilter)) return true;
    if (bucket.adm3?.buckets.some(includesFilter)) return true;
    return false;
  };

  const listItem = (item: any, index: number, paramName: string, path: string[], parentChecked: boolean) => {

    const childAggregation = paramName + (path.length + 1);
    const checked = isChecked(paramName, path);


    return (
      <li key={index} className="my-0">
        <label>
          <input type="checkbox" checked={checked} onChange={(e) => { toggleAdm(e.target.checked, paramName, path)}} className='mr-2' />
          {item.key} <span className="bg-neutral-50 text-xs px-2 py-[1px] rounded-full">{item.doc_count}</span>
        </label>

      {checked && item[childAggregation]?.buckets.length ? <ul className="flex flex-col ml-6 my-2 gap-2">  {sortBuckets(item[childAggregation]?.buckets).map((subitem, subindex) => {
        return listItem(subitem, subindex, paramName, [subitem.key, ...path], checked || parentChecked)

      })} </ul> : null}
      
      </li>

    )
  }



  return (
    <>
    { !isLoading &&
    <div className="flex flex-col gap-4 p-2">
    <div className='flex gap-2'>
      <input onChange={(e) => setFilterSearch(e.target.value.toLowerCase())} className="bg-neutral-50 border rounded-sm border-neutral-300 grow"></input>
    <select onChange={(e) => setSortMethod(e.target.value)}>
        <option value="key">alfabetisk</option>
        <option value="doc_count">antall treff</option>
    </select>
    <IconButton className="text-xl" label={sortOrder == 'asc' ? 'Sorter stigende': 'Sorter synkende'} onClick={handleSortOrderChange}>{sortOrder == 'asc' ? <PiSortDescending/>: <PiSortAscending/> }</IconButton>
    {paramLookup.get('adm') ?
    <IconButton type="button" label="Fjern områdefiltre" onClick={useClearFilter} className="icon-button ml-auto">
      <PiTrashFill className="text-xl text-neutral-800" aria-hidden="true"/>
    </IconButton>
    : null
    }
    </div>
    { facetAggregation?.buckets ?
    <ul className='flex flex-col mx-2'>
      {sortBuckets(facetAggregation?.buckets).filter(includesFilter).map((item, index) => (
        listItem(item, index, 'adm', [item.key], false)
      ))}

    </ul>
    : <></>
    }
    </div>
  } </>)

}