'use client'
import { SearchContext } from "@/app/map-search-provider"
import { useContext } from "react"
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
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
    const size = useQueryState('size', parseAsInteger.withDefault(20))[0]



    


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


    
    

     


  return (
    <>
    <ul id="result_list" className='flex flex-col mb-2 divide-y divide-neutral-400'>


{totalHits?.value ? <>
  { Array.from({length: Math.min(size, totalHits?.value)}, (_, i) => {
    if (i == (size -1) && size < totalHits?.value && i < resultData.length) {
      const hit = resultData[i]
      return <li className="w-full flex justify-center py-4" key={hit._id}>
                <Link className="rounded-full bg-neutral-100 font-semibold px-8 py-2 no-underline" href={serialize(new URLSearchParams(searchParams), {size: size + 40})}>Vis flere</Link>
              </li>
    }
    else if (i < resultData.length) {
      const hit = resultData[i]
      return <ResultItem key={hit._id} hit={hit} isMobile={isMobile}/>
    }
    else {

      return <li className="h-14 flex flex-col mx-2 flex-grow justify-center gap-1" key={i}>
        <div className="bg-neutral-200 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 4, 10)}rem`}}></div>
        <div className="bg-neutral-200 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 10, 16)}rem`}}></div>
      </li>
      
    }
  }
  )}
</> : null}

      
    </ul>
      
      {searchError ? <div className="flex justify-center">
        <div role="status" aria-live="polite" className="text-primary-600 pb-4"><strong>{searchError.status}</strong> Det har oppstått en feil</div>
      </div>
      : !isLoading && !resultData?.length &&  <div className="flex justify-center">
      <div role="status" aria-live="polite" className="text-neutral-950 pb-4">Ingen søkeresultater</div>
    </div>}
    </>
    )
}
