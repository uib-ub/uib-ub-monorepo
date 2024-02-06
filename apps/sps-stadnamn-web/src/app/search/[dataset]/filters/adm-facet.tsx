import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { queryWithout, queryStringWithout } from '@/lib/search-params';

export default function AdmFacet({ setFilterStatus }: { setFilterStatus: (status: string) => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sortMethod, setSortMethod] = useState('doc_count');
  const [filter, setFilter] = useState('');
  const facetQuery = queryStringWithout(['document', 'view', 'adm1', 'adm2', 'page', 'size']);
  const paramLookup = useSearchParams()
  const searchParams = queryWithout(['document', 'view'])
  const [facetAggregation, setFacetAggregation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    setFilterStatus('loading');
    fetch('/api/facet?dataset=hord&'+ facetQuery).then(response => response.json()).then(es_data => {
      setFacetAggregation(es_data.aggregations?.adm1)
      setTimeout(() => {
        setFilterStatus('expanded');
      }, 200);
      setIsLoading(false);
    })
    }, [facetQuery]
    )



  const toggleFilter = (checked: boolean, name: string, value: string) => {

    if (checked) {
      const updatedParams = new URLSearchParams([...searchParams, [name, value]]).toString()
      router.push(pathname + "?" + updatedParams)

    }
    else {
      const updatedParams = new URLSearchParams(searchParams.filter(item => item[0] != name || item[1] != value)).toString()
      router.push(pathname + "?" + updatedParams)

    }
  }


  const sortBuckets = (buckets: any) => {
    return [...buckets].sort((a, b) => {
      if (sortMethod === 'doc_count') {
        return b.doc_count - a.doc_count;
      } else {
        return a.key.localeCompare(b.key, 'nb');
      }
    });
  };

  return (
    <>
    { !isLoading &&
    <div className="flex flex-col gap-2">
    <div className='flex gap-2'>
      <input onChange={(e) => setFilter(e.target.value.toLowerCase())} className="bg-neutral-50 border rounded-sm border-neutral-300 grow"></input>
    <select onChange={(e) => setSortMethod(e.target.value)}>
        <option value="doc_count">antall treff</option>
        <option value="alphabetical">alfabetisk</option>
    </select>
    </div>
    { facetAggregation?.buckets ?
    <ul className='flex flex-wrap gap-x-10'>
      {sortBuckets(facetAggregation?.buckets).filter(item => item.key.toLowerCase().includes(filter) || item.adm2.buckets.some((subitem: { key: string; }) => subitem.key.toLowerCase().includes(filter))).map((item, index) => (
        <li key={index} className='mb-2'>
          <label>
            <input type="checkbox" className='mr-2'/>
            {item.key} <span className="bg-neutral-50 text-xs px-2 py-[1px] rounded-full">{item.doc_count}</span>
          </label>
            
            <ul>
              {sortBuckets(item.adm2.buckets).filter(subitem => subitem.key.toLowerCase().includes(filter)).map((subitem, subindex) => (
                <li key={subindex} className="ml-6 mt-1 my-1">
                  <label>
                    <input type="checkbox" checked={paramLookup.has('adm2', subitem.key) || paramLookup.has('adm1', item.key)} value={subitem.key} onChange={(e) => { toggleFilter(e.target.checked, 'adm2', subitem.key)}} className='mr-2' />
                    {subitem.key} <span className="bg-neutral-50 text-xs px-2 py-[1px]  rounded-full">{subitem.doc_count}</span>
                    
                  </label>
                </li>
              ))}
            </ul>
          
        </li>
      ))}

    </ul>
    : <></>
    }
    </div>
  } </>)

}