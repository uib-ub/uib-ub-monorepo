import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQueryWithout, useQueryStringWithout } from '@/lib/search-params';

interface BucketItem {
  key: string;
  adm2: {
    buckets: Array<BucketItem>;
  };
  doc_count: number;
}

interface FacetAggregation {
  buckets: Array<BucketItem>;
}


export default function AdmFacet({ setFilterStatus }: { setFilterStatus: (status: string) => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const [sortMethod, setSortMethod] = useState('key');
  const [filter, setFilter] = useState('');
  const facetQuery = useQueryStringWithout(['document', 'view', 'adm1', 'adm2', 'page', 'size']);
  const paramLookup = useSearchParams()
  const searchParams = useQueryWithout(['document', 'view'])
  const [facetAggregation, setFacetAggregation] = useState<FacetAggregation | undefined>(undefined);
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
        return parseInt(b.doc_count) - parseInt(a.doc_count);
      } else {
        if (a.label && b.label) {
          return a.label.buckets[0].key.localeCompare(b.label.buckets[0].key, 'nb');
        }  
        return a.key.localeCompare(b.key, 'nb');
      }
    });
  };

  const admIdentifier = (subitem: any) => {
    return subitem.key + "_" + subitem.label?.buckets[0].key
  }

  return (
    <>
    { !isLoading &&
    <div className="flex flex-col gap-2">
    <div className='flex gap-2'>
      <input onChange={(e) => setFilter(e.target.value.toLowerCase())} className="bg-neutral-50 border rounded-sm border-neutral-300 grow"></input>
    <select onChange={(e) => setSortMethod(e.target.value)}>
        <option value="key">alfabetisk</option>
        <option value="doc_count">antall treff</option>
        
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
            {sortBuckets(item.adm2.buckets).filter(item => item.key.toLowerCase().includes(filter) || item.adm3?.buckets.some((subitem: { key: string; }) => subitem.key.toLowerCase().includes(filter))).map((subitem, subindex) => (
                <li key={subindex} className="ml-6 mt-1 my-1">
                 <label>
                    <input type="checkbox" checked={paramLookup.has('adm2', admIdentifier(subitem)) || paramLookup.has('adm1', item.key)} value={subitem.key} onChange={(e) => { toggleFilter(e.target.checked, 'adm2', admIdentifier(subitem))}} className='mr-2' />
                    {subitem.label?.buckets[0].key} <span className="bg-neutral-50 text-xs px-2 py-[1px]  rounded-full">{subitem.doc_count}</span>
                    
                  </label>
                  {sortBuckets(subitem.adm3?.buckets).filter(item => item.key.toLowerCase().includes(filter)).map((subsubitem, subsubindex) => (
                    <li key={subsubindex} className="ml-6 mt-1 my-1">
                      <label>
                        <input type="checkbox" checked={paramLookup.has('adm3', subsubitem.key)} value={subsubitem.key} onChange={(e) => { toggleFilter(e.target.checked, 'adm3', subsubitem.key)}} className='mr-2' />
                        {subsubitem.key} <span className="bg-neutral-50 text-xs px-2 py-[1px]  rounded-full">{subsubitem.doc_count}</span>
                      </label>
                    </li>
                  ))}
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