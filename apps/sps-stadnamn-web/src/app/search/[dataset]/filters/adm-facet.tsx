import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
  const [sortMethod, setSortMethod] = useState('key');
  const [filterSearch, setFilterSearch] = useState('');
  const facetQuery = useQueryStringWithout(['document', 'view', 'adm', 'page', 'size', 'sort']);
  const paramLookup = useSearchParams()
  const searchParams = useQueryWithout(['document', 'view'])
  const [facetAggregation, setFacetAggregation] = useState<FacetAggregation | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const clearedFilters = useQueryStringWithout(['adm', 'page'])

  useEffect(() => {
    setFilterStatus('loading');
    fetch('/api/facet?dataset=hord&'+ facetQuery).then(response => response.json()).then(es_data => {
      setFacetAggregation(es_data.aggregations?.adm1)
      setTimeout(() => {
        setFilterStatus('expanded');
      }, 200);
      setIsLoading(false);
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [facetQuery]
    )

  const useClearFilter = () => {
    router.push(pathname + '?' + clearedFilters)
  }

  const handleSortOrderChange = () => {
    setSortOrder(prevSortOrder => prevSortOrder === 'asc' ? 'desc' : 'asc');
  };




  const toggleAdm1 = (checked: boolean, value: string) => {
    const newParams = searchParams.filter(item=> {
      if (item[0] != 'adm') return true // Ignore other params
      if (item[1] == value) return false // remove self
      const path = item[1].split('_')
      if (path.length > 1 && path.slice(-1)[0] == value) return false // remove children (will still appear as checked if parent is checked)
      return true
    })
    if (checked) {
      newParams.push(['adm', value]) // add self
    }
    router.push(pathname + "?" + new URLSearchParams(newParams).toString())
  }



  const toggleAdm2 = (checked: boolean, value: string) => {
    const ownItems = value.split('_')
    const parent = ownItems.slice(-1)[0]
    const newParams = searchParams.filter(param => {
      if (param[0] != 'adm') return true // Ignore other params
      if (param[1] == value) return false // remove self
      const path = param[1].split('_')
      if (path.length == 3 && path.slice(1).join('_') == value) return false // remove children (will still appear as checked if parent is checked)
      if (parent == param[1]) return false // remove parent
      return true
    })
    if (checked) {
      newParams.push(['adm', value]) // add self
    }
    else {
      if (paramLookup.has('adm', parent)) {
        facetAggregation?.buckets.find(item => item.key == parent)?.adm2?.buckets.forEach(aggregation => {
          if (aggregation.key + "_" + parent != value) {
            newParams.push(['adm', aggregation.key + "_" + parent])
          }
        })
      }

    }
    router.push(pathname + "?" + new URLSearchParams(newParams).toString())
  }

  const toggleAdm3 = (checked: boolean, value: string) => {
    const ownItems = value.split('_')
    const parent = ownItems.slice(1).join('_')
    const grandparent = ownItems.slice(-1)[0]
    const newParams = searchParams.filter(param=> {
      if (param[0] != 'adm') return true // Ignore other params
      if (param[1] == value) return false // remove self
      if (parent == param[1]) return false // remove parent
      if (grandparent == param[1]) return false // remove grandparent
      return true
    })

    if (checked) {
      newParams.push(['adm', value]) // add self
    }
    else if (paramLookup.has('adm', parent) || paramLookup.has('adm', grandparent)) {
      const grandparentAggs = facetAggregation?.buckets.find(item => item.key == grandparent)?.adm2
      // add siblings of parent
      if (paramLookup.has('adm', grandparent)) {
        grandparentAggs?.buckets.forEach(aggregation => {
          if (aggregation.key + "_" + grandparent != parent) {
            newParams.push(['adm', aggregation.key + "_" + grandparent])
          }
        })
      }

      // add siblings
      const parentName = parent.split('_')[0]
      grandparentAggs?.buckets.find(item => item.key == parentName)?.adm3?.buckets.forEach(aggregation => {
        if (aggregation.key + "_" + parent != value) {
          newParams.push(['adm', aggregation.key + "_" + parent])
        }
      })
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
    <div className="flex flex-col gap-2 px-4 py-2">
    <div className='flex gap-2'>
      <input onChange={(e) => setFilterSearch(e.target.value.toLowerCase())} className="bg-neutral-50 border rounded-sm border-neutral-300 grow"></input>
    <select onChange={(e) => setSortMethod(e.target.value)}>
        <option value="key">alfabetisk</option>
        <option value="doc_count">antall treff</option>
    </select>
    <IconButton className="text-xl" label={sortOrder == 'asc' ? 'Sorter stigende': 'Sorter synkende'} onClick={handleSortOrderChange}>{sortOrder == 'asc' ? <PiSortDescending/>: <PiSortAscending/> }</IconButton>
    {paramLookup.get('adm') ?
    <IconButton type="button" label="Fjern områdefiltre" onClick={useClearFilter} className="icon-button ml-auto">
      <PiTrashFill className="text-xl" aria-hidden="true"/>
    </IconButton>
    : null
    }
    </div>
    { facetAggregation?.buckets ?
    <ul className='flex flex-wrap gap-x-10'>
      {sortBuckets(facetAggregation?.buckets).filter(item => item.key.toLowerCase().includes(filterSearch) || item.adm2.buckets.some((subitem: { key: string; }) => subitem.key.toLowerCase().includes(filterSearch))).map((item, index) => (
        <li key={index} className='mb-2'>
          <label>
            <input type="checkbox" className='mr-2' checked={paramLookup.has('adm', item.key)} onChange={(e) => { toggleAdm1(e.target.checked, item.key)}} />
            {item.key} <span className="bg-neutral-50 text-xs px-2 py-[1px] rounded-full">{item.doc_count}</span>
          </label>
          {item.adm2 && <ul>
            {sortBuckets(item.adm2.buckets).filter(item => item.key.toLowerCase().includes(filterSearch) || item.adm3?.buckets.some((subitem: { key: string; }) => subitem.key.toLowerCase().includes(filterSearch))).map((subitem, subindex) => (
                <li key={subindex} className="ml-6 mt-1 my-1">
                 <label>
                    <input type="checkbox" checked={paramLookup.has('adm', subitem.key + "_" + item.key) || paramLookup.has('adm', item.key)} onChange={(e) => { toggleAdm2(e.target.checked, subitem.key + "_" + item.key)}} className='mr-2' />
                    {subitem.key} <span className="bg-neutral-50 text-xs px-2 py-[1px]  rounded-full">{subitem.doc_count}</span>
                    
                  </label>
                  {subitem.adm3 && <ul>
                  {sortBuckets(subitem.adm3?.buckets).filter(item => item.key.toLowerCase().includes(filterSearch)).map((subsubitem, subsubindex) => (
                    <li key={subsubindex} className="ml-6 mt-1 my-1">
                      <label>
                        <input type="checkbox" checked={paramLookup.has('adm', subsubitem.key + "_" + subitem.key + "_" + item.key) || paramLookup.has('adm', subitem.key + "_" + item.key) || paramLookup.has('adm', item.key)} onChange={(e) => { toggleAdm3(e.target.checked, subsubitem.key + "_" + subitem.key + "_" +item.key)}} className='mr-2' />
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