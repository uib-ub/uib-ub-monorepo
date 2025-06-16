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


const PER_PAGE = 100

export default function SearchResults() {
    const { resultData, totalHits, isLoading, searchError } = useContext(SearchContext)

    const [additionalResults, setAdditionalResults] = useState<any[]>([])
    const [loadingAdditionalResults, setLoadingAdditionalResults] = useState(false)
    const [offset, setOffset] = useState(0)
    const {searchQueryString } = useSearchQuery()


    // Reset when search query changes
    useEffect(() => {
      setAdditionalResults([])
      setOffset(resultData?.length || 0)
    }, [resultData])

    const loadMore = () => {
      setOffset(resultData.length + additionalResults.reduce((acc, curr) => acc + curr.length, 0))
    }






    useEffect(() => {
      if (offset === 0) return;
      setLoadingAdditionalResults(true)
      const url = `/api/search/map?${searchQueryString}&size=${PER_PAGE}&from=${offset}`
      fetch(url)
        .then(response => {
          if (!response.ok) {
            setLoadingAdditionalResults(false)
            throw response
          }
          return response.json()
        })
        .then(es_data => {
          setAdditionalResults(prev => [...prev, trimResultData(es_data.hits.hits, es_data.hits.total.value)])
        })
        .finally(() => setLoadingAdditionalResults(false))
    }, [searchQueryString, offset, totalHits])

    return (
      <>
        {/* Add detailed count breakdown */}
        <ul id="result_list" className='flex flex-col mb-2 divide-y divide-neutral-200'>
          {/* Loading states */}
          {isLoading ? Array.from({length: 10}).map((_, i) => (
            <li className="h-14 flex flex-col mx-2 flex-grow justify-center gap-1" key={i}>
              <div className="bg-neutral-200 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 4, 10)}rem`}}></div>
              <div className="bg-neutral-200 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 10, 16)}rem`}}></div>
            </li>
          ))
          : totalHits?.value ? (
            <>
              {/* Only use GroupedItems if total results > 20, otherwise use ResultItem directly */}
              {totalHits.value > 10 ? (


                  <>
                  <GroupedItems resultData={resultData}/>
                  { additionalResults.length > 0 && Array.from({length: additionalResults.length + (resultData.length + additionalResults.reduce((acc, curr) => acc + curr.length, 0) < totalHits?.value ? 1 : 0)}).map((_, i: number) => {
                    if (i < additionalResults.length) {
                      return (
                    <GroupedItems 
                    resultData={additionalResults[i]}

                    key={i}
                    />
                    )
                  } else if (loadingAdditionalResults) {
                    return (
                    <div className="" key={i}
                          aria-label="Laster resultater"
                          tabIndex={0}
                    
                    >
                      {Array.from({length: 50}).map((_, j) => (
                        <div
                          
                          key={j}
                          className="h-14 flex flex-col mx-2 flex-grow justify-center gap-1"
                        >
                          <div className="bg-neutral-200 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(j, 4, 10)}rem`}}></div>
                          <div className="bg-neutral-200 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(j, 10, 16)}rem`}}></div>
                        </div>
                      ))}
                    </div>
                  )
                  } else {
                    return (
                      <li className="p-4" key={i}>
                        <button
                          onClick={loadMore}
                          className="bg-neutral-100 p-4 rounded-full w-full block"
                          key={i}
                        >
                          Last fleire resultater
                        </button>
                      </li>
                    )
                  }
                })}

                  

                </>
        

                ) : (
                <>
                  {resultData.map((hit: any) => (
                    <ResultItem key={hit._id} hit={hit} />
                  ))}
                </>
              )}
            </>
          ) : null}
        </ul>
        
        {searchError ? (
          <div className="flex justify-center">
            <div role="status" aria-live="polite" className="text-primary-600 pb-4">
              <strong>{searchError.status}</strong> Det har oppstått ein feil
            </div>
          </div>
        ) : !isLoading && !resultData?.length && (
          <div className="flex justify-center">
            <div role="status" aria-live="polite" className="text-neutral-950 pb-4">
              Ingen søkeresultater
            </div>
          </div>
        )}
      </>
    )
}
