'use client'
import { SearchContext } from "@/app/search-provider"
import { useCallback, useContext, useEffect, useState } from "react"
import { useSearchParams } from 'next/navigation';
import ResultItem from "./result-item";
import { getSkeletonLength, stringToBase64Url } from "@/lib/utils";
import { useMode, useSearchQuery } from "@/lib/search-params";
import { useRouter } from "next/navigation";
import { CollapsedContext } from "@/app/collapsed-provider";


const PER_PAGE = 30

export default function SearchResults() {
  const { collapsedResults, isLoadingResults} = useContext(CollapsedContext)
  const searchParams = useSearchParams()
  const router = useRouter()
  const page = searchParams.get('page')
  const { totalHits, isLoading, searchError } = useContext(SearchContext)
  const group = searchParams.get('group')


    return (
      <>
        <ul id="result_list" className='flex flex-col mb-2 divide-y divide-neutral-200'>
          {/* Render existing results */}
          {collapsedResults.map((hit, index) => (
           
              <ResultItem key={hit._id} hit={hit} />

          ))}
          
          {/* Render loading skeletons */}
          {isLoadingResults && Array.from({length: PER_PAGE}).map((_, i) => (
            <li className="h-14 flex flex-col mx-2 flex-grow justify-center gap-1" key={`skeleton-${collapsedResults.length + i}`}>
              <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 4, 10)}rem`}}></div>
              <div className="bg-neutral-900/10 rounded-full h-4 animate-pulse" style={{width: `${getSkeletonLength(i, 10, 16)}rem`}}></div>
            </li>
          ))}
          
          {/* Render "load more" button */}
          {!isLoadingResults && collapsedResults.reduce((acc, curr) => acc + (curr.inner_hits?.group?.hits?.total?.value || 0), 0) < totalHits?.value && (
            <li className="p-4 px-8">
              <button 
                type="button" 
                onClick={(e) => {
                  e.preventDefault();
                  const newUrl = new URLSearchParams(searchParams)
                  newUrl.set('page', (parseInt(page || '0') + 1).toString())
                  router.push(`?${newUrl.toString()}`);
                }} 
                className="bg-neutral-100 p-4 rounded-full w-full block"
              >
                Last fleire resultat
              </button>
            </li>
          )}
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
