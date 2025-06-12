'use client'
import { SearchContext } from "@/app/search-provider"
import { useContext, useEffect, useState } from "react"
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createSerializer, parseAsArrayOf, parseAsFloat, parseAsInteger, parseAsString, useQueryState } from "nuqs";
import ResultItem from "./result-item";
import { getSkeletonLength } from "@/lib/utils";
import { PiCaretDown, PiCaretUp } from "react-icons/pi";
import GroupedItems from "./grouped-items"
import { useSearchQuery } from "@/lib/search-params";


export default function SearchResults() {
    const searchParams = useSearchParams()
    const serialize = createSerializer({
        from: parseAsInteger,
        size: parseAsInteger,
        doc: parseAsString,
        center: parseAsArrayOf(parseAsFloat, ','),
    });

    const { resultData, totalHits, isLoading, searchError } = useContext(SearchContext)

    const [additionalResults, setAdditionalResults] = useState<any[]>([])
    const [loadingAdditionalResults, setLoadingAdditionalResults] = useState(false)
    const [pagesScrolled, setPagesScrolled] = useState(0)
    const {searchQueryString } = useSearchQuery()

    // Reset when search query changes
    useEffect(() => {
      setAdditionalResults([])
      setPagesScrolled(0)
    }, [searchQueryString])

    // Only fetch when pagesScrolled > 0 (after clicking Load more)
    useEffect(() => {
      if (pagesScrolled === 0) return;

      const url = `/api/search/map?${searchQueryString}&size=40&from=${pagesScrolled*40}`
      console.log("URL", url)
      setLoadingAdditionalResults(true)
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw response
          }
          return response.json()
        })
        .then(es_data => {

          setAdditionalResults(prev => {

            return [...prev, ...es_data.hits.hits]
          })
        })
        .finally(() => setLoadingAdditionalResults(false))
    }, [searchQueryString, pagesScrolled])

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
                  {additionalResults.length > 0 && 
                    Array.from({ length: Math.ceil(additionalResults.length / 40) }).map((_, batchIndex) => {
                      const batchResults = additionalResults.slice(batchIndex * 40, (batchIndex + 1) * 40);
                      return (
                        <GroupedItems 
                          key={`batch-${batchIndex + 1}`}
                          resultData={batchResults}
                        />
                      );
                    })
                  }
                </>
              ) : (
                <>
                  {resultData.map((hit: any) => (
                    <ResultItem key={hit._id} hit={hit} />
                  ))}
                  {additionalResults.map((hit: any) => (
                    <ResultItem key={hit._id} hit={hit} />
                  ))}
                </>
              )}
            </>
          ) : null}

          {loadingAdditionalResults && Array.from({length: 20}).map((_, i) => (
            <li className="h-14 flex flex-col mx-2 flex-grow justify-center gap-1" key={i}>
              <div className="bg-neutral-200 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 4, 10)}rem`}}></div>
              <div className="bg-neutral-200 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 10, 16)}rem`}}></div>
            </li>
          ))}
        </ul>
        
        {/* Show Load More button if there are more results to load */}
        {totalHits && (resultData.length + additionalResults.length) < totalHits.value && (
          <button onClick={() => setPagesScrolled(pagesScrolled + 1)}>Load more</button>
        )}

        {/* Error and no results states */}
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
