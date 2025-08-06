'use client'
import { SearchContext } from "@/app/search-provider"
import { useContext, useEffect, useState } from "react"
import { useSearchParams } from 'next/navigation';
import ResultItem from "./result-item";
import { getSkeletonLength } from "@/lib/utils";
import { useSearchQuery } from "@/lib/search-params";
import { useRouter } from "next/navigation";


const PER_PAGE = 30

export default function SearchResults() {
    const { totalHits, isLoading, searchError } = useContext(SearchContext)

    const [collapsedResults, setCollapsedResults] = useState<any[]>([])
    const [isLoadingResults, setIsLoadingResults] = useState(false)
    const searchParams = useSearchParams()
    const page = searchParams.get('page')
    const router = useRouter()
    const {searchQueryString } = useSearchQuery()



    // Reset when search query changes
    
    useEffect(() => {
      setCollapsedResults([])
    }, [searchQueryString])

    



    useEffect(() => {
      setIsLoadingResults(true)
      const url = `/api/search/collapsed?${searchQueryString}&size=${(page ? PER_PAGE * (parseInt(page) + 1) : PER_PAGE)}&from=${(page ? parseInt(page) : 0) * PER_PAGE || 0}`
      fetch(url)
        .then(response => {
          if (!response.ok) {
            setIsLoadingResults(false)
            throw response
          }
          return response.json()
        })
        .then(es_data => {

          setCollapsedResults(prev => [...prev, ...es_data.hits.hits.filter((hit: any) => !prev.find((prevHit: any) => prevHit._id === hit._id))])
        })
        .finally(() => setIsLoadingResults(false))
    }, [searchQueryString, page])

    // Add keyboard navigation - new effect
    /*



    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!collapsedResults.length || !searchParams) return;
            if (!e.shiftKey) return;
            
            const currentDoc = searchParams.get('doc');
            const currentIndex = collapsedResults.findIndex(item => item.fields.uuid[0] === currentDoc);
            
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                let newIndex: number;
                
                if (currentIndex === -1) {
                    newIndex = e.key === 'ArrowDown' ? 0 : collapsedResults.length - 1;
                } else {
                    newIndex = e.key === 'ArrowDown' 
                        ? Math.min(collapsedResults.length - 1, currentIndex + 1)
                        : Math.max(0, currentIndex - 1);
                }

                if (newIndex !== currentIndex && collapsedResults[newIndex].fields.uuid[0]) {
                    const params = new URLSearchParams(searchParams);
                    params.set('doc', collapsedResults[newIndex].fields.uuid[0]);
                    if (collapsedResults[newIndex].fields.group[0]) {
                        params.set('group', stringToBase64Url(collapsedResults[newIndex].fields.group[0]))
                    }
                    router.push(`?${params.toString()}`);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [collapsedResults, searchParams, router]);

    */

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
                Last fleire resultat {page}
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
