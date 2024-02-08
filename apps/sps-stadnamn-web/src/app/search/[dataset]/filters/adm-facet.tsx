import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQueryWithout, useQueryStringWithout } from '@/lib/search-params';
import { waitForDebugger } from 'inspector';

interface BucketItem {
  key: string;
  adm2?: {
    buckets: Array<BucketItem>;
  };
  adm3?: {
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




  const toggleFilter = (checked: boolean, value: string, level: number) => {
    const newParams: string[][] = []
    const ownSubitems = value.split('_')

    if (checked) {
      // TODO: check parent if all children are checked
      
      // uncheck children
      let filteredParams = searchParams.filter(item => {
          if (level == 1 && item[1].split("_").slice(-1)[0] == value) return
          if (level == 2 && item[1].split("_").slice(-2).join("_") == value) return
        return true
      }
      
      )


      const updatedParams = new URLSearchParams([...filteredParams, ['adm', value]]).toString()
      router.push(pathname + "?" + updatedParams)

    }
    else {
      const newParams: string[][] = []
      const ownSubitems = value.split('_')
      const parent = ownSubitems.slice(1).join('_')
      
      // Add sibling filters if parent checked
      if (level == 2 ) {
        if (paramLookup.has('adm', parent)) {
          let adm1 = facetAggregation?.buckets.find(item => item.key == ownSubitems[ownSubitems.length - 1])
          if (adm1 && adm1.adm2) {
            adm1.adm2?.buckets.forEach(item => {
              if (item.key != ownSubitems[0]) {
                newParams.push(['adm', item.key + "_" + ownSubitems[1]])
              }
            })
          }
        }
      }
      if (level == 3) {
        const grandparent = ownSubitems.slice(2).join('_')
      }






      /*
      const newParams: string[][] = []
      const ownSubitems = value.split('_')
      const parent = ownSubitems.slice(1).join('_')
      const grandparent = ownSubitems.slice(2).join('_')






      
      if (level > 1 && paramLookup.has('adm', parent) || paramLookup.has('adm', grandparent)) {
        // Find parent in facetAggregation.buckets
        let adm1 = facetAggregation?.buckets.find(item => item.key == ownSubitems[ownSubitems.length - 1])
        if (adm1 && adm1.adm2) {
          adm1.adm2?.buckets.forEach(item => {
            if (item.key != ownSubitems[0] && (level == 2 || paramLookup.has('adm', grandparent))) {
              console.log("item.key", item.key)
              console.log(ownSubitems)
              newParams.push(['adm', item.key + "_" + ownSubitems[1]])
            }
            if (level == 3 && item.adm3) {
              item.adm3.buckets.forEach((subitem: { key: string; }) => {
                if (subitem.key != ownSubitems[0]) {
                  newParams.push(['adm', subitem.key + "_" + item.key + "_" + ownSubitems[1]])
                }
              
              })
            }
            
          })
        }
      }
        
      */

      // Remove filters
      const updatedParams = new URLSearchParams([...newParams, ...searchParams.filter(item => {
        if (item[1] == value) return
        let subitems = item[1].split('_')
        
        if (level == 1 && subitems.length > 1 && subitems[subitems.length - 1] == value) return
        if (level == 2 && subitems.length > 2 && subitems.slice(1).join("_") == value) return
        if (level == 2 && subitems[0] == ownSubitems[1]) return // remove parent
        if (level == 3 && subitems.length > 3 && subitems.slice(2).join("_") == value) return
        //if (level == 3 && subitems[0] == ownSubitems[2]) return // remove parents
        return true

      })]).toString()
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
            <input type="checkbox" className='mr-2' checked={paramLookup.has('adm', item.key)} onChange={(e) => { toggleFilter(e.target.checked, item.key, 1)}} />
            {item.key} <span className="bg-neutral-50 text-xs px-2 py-[1px] rounded-full">{item.doc_count}</span>
          </label>
          {item.adm2 && <ul>
            {sortBuckets(item.adm2.buckets).filter(item => item.key.toLowerCase().includes(filter) || item.adm3?.buckets.some((subitem: { key: string; }) => subitem.key.toLowerCase().includes(filter))).map((subitem, subindex) => (
                <li key={subindex} className="ml-6 mt-1 my-1">
                 <label>
                    <input type="checkbox" checked={paramLookup.has('adm', subitem.key + "_" + item.key) || paramLookup.has('adm', item.key)} onChange={(e) => { toggleFilter(e.target.checked, subitem.key + "_" + item.key, 2)}} className='mr-2' />
                    {subitem.key} <span className="bg-neutral-50 text-xs px-2 py-[1px]  rounded-full">{subitem.doc_count}</span>
                    
                  </label>
                  {subitem.adm3 && <ul>
                  {sortBuckets(subitem.adm3?.buckets).filter(item => item.key.toLowerCase().includes(filter)).map((subsubitem, subsubindex) => (
                    <li key={subsubindex} className="ml-6 mt-1 my-1">
                      <label>
                        <input type="checkbox" checked={paramLookup.has('adm', subsubitem.key + "_" + subitem.key + "_" + item.key) || paramLookup.has('adm', subitem.key + "_" + item.key) || paramLookup.has('adm', item.key)} onChange={(e) => { toggleFilter(e.target.checked, subsubitem.key + "_" + subitem.key + "_" +item.key, 3)}} className='mr-2' />
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