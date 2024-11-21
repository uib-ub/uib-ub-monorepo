'use client'
import { SearchContext } from "@/app/map-search-provider"
import { useContext } from "react"
import { useSearchParams, usePathname, useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createSerializer, parseAsArrayOf, parseAsFloat, parseAsInteger, parseAsString, useQueryState } from "nuqs";
import ResultItem from "./result-item";
import { useSearchQuery } from "@/lib/search-params";
import { getSkeletonLength } from "@/lib/utils";


export default function SearchResults({isMobile}: {isMobile: boolean}) {
    const searchParams = useSearchParams()
    const serialize = createSerializer({
        from: parseAsInteger,
        size: parseAsInteger,
        doc: parseAsString,
        center: parseAsArrayOf(parseAsFloat, ','),
    });

    const pathname = usePathname()
    const router = useRouter()
    const { resultData, totalHits, isLoading, searchError} = useContext(SearchContext)
    const [additionalItems, setAdditionalItems] = useState<any[]>([])
    const [size, setSize] = useQueryState('size', parseAsInteger.withDefault(20))
    const { searchQueryString } = useSearchQuery()



    


    const sortResults = () => {
      const params = new URLSearchParams(searchParams)
      if (searchParams.get('sort') == 'desc') {
        params.delete('sort')
      } else {
        params.set('sort', 'desc')
      }
      params.delete('page')
        
      router.push(pathname + "?" + params.toString())
    }

    const orderBy = (e: any) => {
      const params = new URLSearchParams(searchParams)
      if (e.target.value == '') {
        params.delete('orderBy')
      } else {
        params.set('orderBy', e.target.value)
      }
      params.delete('page')
        
      router.push(pathname + "?" + params.toString())
    }


    
    useEffect(() => {
      if (size > 20) {
        const newParams = new URLSearchParams(searchQueryString)
        newParams.set('size', (size - 20).toString())
        newParams.set('from', '20')
        fetch(`/api/search/map?${newParams.toString()}`).then(response => response.json()).then(es_data => {
          // Add conditionally to account for double fetches in nextjs strict mode
          setAdditionalItems(es_data.hits?.hits)
            

        }

        )
      }
    }, [size, searchQueryString])

     


  return (
    <>
    <ul id="result_list" className='flex flex-col mb-2 divide-y divide-neutral-400'>
      {resultData?.map((hit: any) => (
        <ResultItem key={hit._id} hit={hit} isMobile={isMobile}/>
      ))}


{totalHits && totalHits.value > resultData.length && <>
  {Array.from({length: Math.min(totalHits.value - resultData.length, size - resultData.length) 
    + (totalHits.value > size ? 1 : 0)
  }, (_, i) => {
    if (i == size - resultData.length && totalHits.value > size) {
      return <li className="w-full flex justify-center py-4" key="load-more">
                <Link className="rounded-full bg-neutral-100 font-semibold px-8 py-2 no-underline" href={serialize(new URLSearchParams(searchParams), {size: size + 40})}>Vis flere</Link>
              </li>
    }
    else {
      const hit = additionalItems?.[i];
      if ( hit) {
        return <ResultItem key={hit._id} hit={hit} isMobile={isMobile}/>
      }
      else {
        return <li className="h-14 flex flex-col mx-2 flex-grow justify-center gap-1" key={i}>
          <div className="bg-neutral-200 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 4, 10)}rem`}}></div>
          <div className="bg-neutral-200 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 10, 16)}rem`}}></div>
        </li>
      }
    }
  }
  )}
</>}

      
    </ul>
      
      {searchError ? <div className="flex justify-center">
        <div role="status" aria-live="polite" className="text-primary-600"><strong>{searchError.status}</strong> Det har oppstått en feil</div>
      </div>
      : !isLoading && !resultData?.length &&  <div className="flex justify-center">
      <div role="status" aria-live="polite" className="text-neutral-950">Ingen søkeresultater</div>
    </div>}
    </>
    )
}
