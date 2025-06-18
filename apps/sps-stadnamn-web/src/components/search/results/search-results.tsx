'use client'
import { SearchContext } from "@/app/search-provider"
import { useContext, useEffect, useState } from "react"
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createSerializer, parseAsArrayOf, parseAsFloat, parseAsInteger, parseAsString, useQueryState } from "nuqs";
import ResultItem from "./result-item";
import { getSkeletonLength, trimResultData } from "@/lib/utils";
import GroupedItems from "./grouped-items"
import { useSearchQuery } from "@/lib/search-params";
import { useRouter } from "next/navigation";


const PER_PAGE = 20

export default function SearchResults() {
    const { resultData, totalHits, isLoading, searchError } = useContext(SearchContext)

    const [collapsedResults, setCollapsedResults] = useState<any[]>([])
    const [isLoadingResults, setIsLoadingResults] = useState(false)
    const searchParams = useSearchParams()
    const page = searchParams.get('page')
    const router = useRouter()
    const {searchQueryString } = useSearchQuery()


    // Reset when search query changes
    useEffect(() => {
      setCollapsedResults([])
      const newUrl = new URLSearchParams(searchParams)
      newUrl.set('page', '0')
      router.push(`?${	newUrl.toString()}`);

    }, [searchQueryString])



    useEffect(() => {
      //if (offset === 0) return;
      setIsLoadingResults(true)
      const url = `/api/search/collapsed?${searchQueryString}&size=${collapsedResults.length == 0 && page ? PER_PAGE * (parseInt(page) + 1): PER_PAGE}&from=${collapsedResults.length || 0}`
      fetch(url)
        .then(response => {
          if (!response.ok) {
            setIsLoadingResults(false)
            throw response
          }
          return response.json()
        })
        .then(es_data => {
          // Filter out any duplicates based on _id before updating state
          const newHits = es_data.hits.hits.filter(
            (newHit: any) => !collapsedResults.some((existingHit: any) => existingHit._id === newHit._id)
          )
          setCollapsedResults(prev => [...prev, ...newHits])
        })
        .finally(() => setIsLoadingResults(false))
    }, [searchQueryString, page])

    return (
      <>
        <ul id="result_list" className='flex flex-col mb-2 divide-y divide-neutral-200'>

          {Array.from({length: 1 + Math.min(PER_PAGE + (parseInt(page || '0') * PER_PAGE), totalHits?.value)}).map((_, i) => {
            if (isLoadingResults) {
              return (
            <li className="h-14 flex flex-col mx-2 flex-grow justify-center gap-1" key={i}>
              <div className="bg-neutral-200 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 4, 10)}rem`}}></div>
              <div className="bg-neutral-200 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 10, 16)}rem`}}></div>
            </li>
            )
            } else if (i < collapsedResults.length) {
              return <ResultItem key={collapsedResults[i]._id} hit={collapsedResults[i]} />
            } else if (i === collapsedResults.length && collapsedResults.reduce((acc, curr) => acc + (curr.inner_hits?.gnidu?.hits?.total?.value || 0), 0) < totalHits?.value) {
              return <button 
                type="button" 
                onClick={(e) => {
                  e.preventDefault();
                  const newUrl = new URLSearchParams(searchParams)
                  newUrl.set('page', (parseInt(page || '0') + 1).toString())
                  router.push(`?${	newUrl.toString()}`);
                }} 
                key={i} 
                className="bg-neutral-100 p-4 rounded-full w-full block"
              >
                Last fleire resultat
              </button>
            }
          })}
          
            
        </ul>
        
        {searchError ? (
          <div className="flex justify-center">
            <div role="status" aria-live="polite" className="text-primary-600 pb-4">
              <strong>{searchError.status}</strong> Det har oppstått ein feil
            </div>
          </div>
        ) : !isLoading && !totalHits?.value && (
          <div className="flex justify-center">
            <div role="status" aria-live="polite" className="text-neutral-950 pb-4">
              Ingen søkeresultater
            </div>
          </div>
        )}
      </>
    )
}
