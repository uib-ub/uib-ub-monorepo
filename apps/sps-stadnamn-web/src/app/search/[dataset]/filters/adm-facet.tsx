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


  const toggleAdm = (checked: boolean, paramName: string, chosenValue: string) => {
    const chosenPath = chosenValue.split('_')
    let hasSibling = false
    const newParams = searchParams.filter(urlParam => {
      if (urlParam[0] != paramName) return true // Ignore other params
      if (urlParam[1] == chosenValue) return false // remove self
      const urlPath = urlParam[1].split('_')

      // remove parents
      if (urlPath.length < chosenPath.length && chosenPath.slice(1).every((value, index) => value == urlPath[index])) return false
      
      if (!checked) {
        // remove children
        if (urlPath.length > chosenPath.length && urlParam.slice(1).every((value, index) => value == chosenPath[index])) return false

      // check if sibling is checked
        if (!hasSibling 
            && urlPath.length >= chosenPath.length 
            && chosenPath.slice(1).every((value, index) => value == urlPath[urlPath.length - chosenPath.length + 1 + index])) {
          hasSibling = true
        }
      }
      return true
    })
    if (checked) {
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



  return (
    <>
    { !isLoading &&
    <div className="flex flex-col gap-2 p-2">
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
    <ul className='flex flex-wrap gap-x-10'>
      {sortBuckets(facetAggregation?.buckets).filter(item => item.key.toLowerCase().includes(filterSearch) || item.adm2.buckets.some((subitem: { key: string; }) => subitem.key.toLowerCase().includes(filterSearch))).map((item, index) => (
        <li key={index} className='mb-2'>
          <label>
            <input type="checkbox" className='mr-2' checked={isChecked('adm', [item.key])} onChange={(e) => { toggleAdm(e.target.checked, 'adm', item.key)}} />
            {item.key} <span className="bg-neutral-50 text-xs px-2 py-[1px] rounded-full">{item.doc_count}</span>
          </label>
          {item.adm2 && isChecked('adm', [item.key])
           && <ul>
            {sortBuckets(item.adm2.buckets).filter(item => item.key.toLowerCase().includes(filterSearch) || item.adm3?.buckets.some((subitem: { key: string; }) => subitem.key.toLowerCase().includes(filterSearch))).map((subitem, subindex) => (
                <li key={subindex} className="ml-6 mt-1 my-1">
                 <label>
                    <input type="checkbox" checked={isChecked('adm', [subitem.key, item.key])} onChange={(e) => { toggleAdm(e.target.checked, 'adm', subitem.key + "_" + item.key)}} className='mr-2' />
                    {subitem.key} <span className="bg-neutral-50 text-xs px-2 py-[1px]  rounded-full">{subitem.doc_count}</span>
                    
                  </label>
                  {subitem.adm3 && isChecked('adm', [subitem.key, item.key])  && <ul>
                  {sortBuckets(subitem.adm3?.buckets).filter(item => item.key.toLowerCase().includes(filterSearch)).map((subsubitem, subsubindex) => (
                    <li key={subsubindex} className="ml-6 mt-1 my-1">
                      <label>
                        <input type="checkbox" checked={paramLookup.has('adm', subsubitem.key + "_" + subitem.key + "_" + item.key)} onChange={(e) => { toggleAdm(e.target.checked, 'adm', subsubitem.key + "_" + subitem.key + "_" +item.key)}} className='mr-2' />
                        {subsubitem.key} <span className="bg-neutral-50 text-xs px-2 py-[1px]  rounded-full">{subsubitem.doc_count}</span>
                      </label>
                    </li>
                  ))}
                  </ul> }
                </li>
              ))}
            </ul> }
          
        </li>
      ))}

    </ul>
    : <></>
    }
    </div>
  } </>)

}