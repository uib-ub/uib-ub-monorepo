import { useState, useEffect, useContext, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSearchQuery, useDataset } from '@/lib/search-params';
import { PiFunnel } from 'react-icons/pi';
import FacetToolbar from './facet-toolbar';
import { GlobalContext } from '@/app/global-provider';
import { fieldConfig } from '@/config/search-config';



export default function ClientFacet({ facetName }: { facetName: string }) {
  const router = useRouter()
  const dataset = useDataset()
  const { removeFilterParams, facetFilters } = useSearchQuery()
  const [facetSearchQuery, setFacetSearchQuery] = useState('');
  const paramsExceptFacet = useMemo(() => removeFilterParams(facetName), [removeFilterParams, facetName])
  const [facetAggregation, setFacetAggregation] = useState<any | undefined>(undefined);
  const searchParams = useSearchParams()
  const [facetIsLoading, setFacetIsLoading] = useState<boolean>(true);
  const {facetOptions, updatePinnedFilters } = useContext(GlobalContext)
  const currentFacet = searchParams.get('facet') || 'adm'

  // Will for instance include "Hordaland" in addition to "Hordaland_Bergen" if the latter is checked
  const expandedFacets = new Set<string>();
  for (const [key, value] of facetFilters) {
    if (key != facetName) continue
    const path = value.split('__')
    for (let i = 0; i < path.length; i++) {
      expandedFacets.add(path.slice(i).join('__'))
    }
  }

  useEffect(() => {
    fetch(`/api/facet?dataset=${dataset}&facets=group.adm1,group.adm2,group.adm3${paramsExceptFacet ? '&' + paramsExceptFacet : ''}`).then(response => response.json()).then(es_data => {
      console.log(es_data)
      setFacetAggregation(es_data.aggregations?.["group.adm1"])
      setFacetIsLoading(false);
    })
    }, [paramsExceptFacet, dataset]
    )



  const isChecked = (paramName: string, ownPath: string[]) => {
    if (searchParams.has(facetName, ownPath.join('__'))) return true
    // Check if in expandedFacets
    if (expandedFacets.has(ownPath.join("__"))) return true
    return false
  }


  const toggleAdm = (beingChecked: boolean, paramName: string, chosenPath: string[]) => {
    const chosenValue = chosenPath.join('__')
    let hasSibling = false

    const newParams =  Array.from(searchParams.entries()).filter(urlParam => {
      if (['parent', 'doc', 'group', 'details', 'zoom', 'center', 'page'].includes(urlParam[0])) return false // remove child view
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

    // Update pinned filters
    updatePinnedFilters(newParams.filter(item => facetOptions[dataset]?.[item[0]]?.pinningActive))



    router.push(`?${new URLSearchParams(newParams).toString()}`)
  }

  const sortBuckets = (buckets: any) => {
    const orderCompare = (a: string, b: string) => {
      return facetOptions[dataset]?.[currentFacet]?.sort === 'asc' ? a.localeCompare(b, 'nb') : b.localeCompare(a, 'nb'); 
    }
    return [...buckets].sort((a, b) => {
      if (facetOptions[dataset]?.[currentFacet]?.sort === 'doc_count') {
        return parseInt(b.doc_count) - parseInt(a.doc_count);
      } else {
        if (a.label && b.label) {
          return orderCompare(a.label.buckets[0].key, b.label.buckets[0].key);
        }
        return orderCompare(a.key, b.key);
      }
    });
  };


  // Memoized RegExp factory to prevent memory leaks
  const createSearchRegex = (() => {
    const cache = new Map();
    return (searchTerm: string) => {
      if (!searchTerm) return null;
      const escaped = searchTerm.replace("-", " ").replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = `(^|\\s)${escaped}`;
      if (!cache.has(pattern)) {
        cache.set(pattern, new RegExp(pattern, 'iu'));
      }
      return cache.get(pattern);
    };
  })();


  const facetSearch = (item: any, baseName: string, level: number): boolean => {
    if (!facetSearchQuery && level == 1) return true
    if (facetSearchQuery && createSearchRegex(facetSearchQuery)?.test(item.key.replace("-", " "))) return true
    const childLevel = level +1
    if (item["group." + baseName + childLevel]?.buckets.some((subitem: any) => facetSearch(subitem, baseName, childLevel))) {
      return true
    } 
    return false
    
  };


  const listItem = (item: any, index: number, baseName: string, path: string[], parentChecked: boolean) => {
    const childAggregation = 'group.' + baseName + (path.length + 1);
    const checked = isChecked(baseName, path);
    let children = item[childAggregation]?.buckets
    children = children?.some((child: any) => child.key[0] != "_") ? children : []
    const filteredChildren = facetSearchQuery && children?.filter((subitem: any) => facetSearch(subitem, baseName, path.length +1))

    
    const label = path[0] == "_false" ? (path.length == 1 ? "[inga verdi]" : "[utan underinndeling]") : item.key   
 

    return (
      <li key={item.key} className="my-0">
        <label className="flex items-baseline">
          <input type="checkbox" checked={checked} onChange={(e) => { toggleAdm(e.target.checked, baseName, path)}} className='mr-2' />
         <span className="text-pretty block">{label} <span className="inline bg-white border border-neutral-300 shadow-sm text-xs px-2 py-[1px] rounded-full">{item.doc_count.toLocaleString('nb-NO', { useGrouping: true })}</span></span>
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
    { true &&
    <div className="flex flex-col gap-2 py-2">
      <div className='flex gap-2'>
        <div className='relative grow'>
          <input aria-label="Søk i områdefilter" onChange={(e) => setFacetSearchQuery(e.target.value.toLowerCase())} 
              className="pl-8 w-full border rounded-md border-neutral-300 p-1"/>
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2">
            <PiFunnel aria-hidden={true} className='text-neutral-500 text-xl'/>
          </span>
        </div>
        
        <FacetToolbar/>
      </div>
      { facetAggregation?.buckets ?
      <fieldset>
        <legend className="sr-only">{`Filtreringsalternativer for områdeinndeling`}</legend>
        <ul className='flex flex-col gap-2 p-2 stable-scrollbar xl:overflow-y-auto inner-slate'>
          {sortBuckets(facetAggregation?.buckets).filter(item => facetSearch(item, facetName, 1)).map((item, index) => (
            listItem(item, index, facetName, [item.key], false)
          ))}
        </ul>
      </fieldset>
      : <></>
      }
    </div>
    } </>)
}