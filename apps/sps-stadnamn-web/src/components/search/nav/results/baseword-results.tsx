'use client'
import { SearchContext } from "@/app/search-provider"
import { useContext } from "react"
import { getSkeletonLength, stringToBase64Url } from "@/lib/utils";
import { CollapsedContext } from "@/app/collapsed-provider";
import Clickable from "@/components/ui/clickable/clickable";
import { GlobalContext } from "@/app/global-provider";


const PER_PAGE = 30

export default function BasewordResults() {
  const { collapsedResults, isLoadingResults} = useContext(CollapsedContext)
  const { totalHits, isLoading, searchError } = useContext(SearchContext)
  const { highlightedGroup, setHighlightedGroup } = useContext(GlobalContext)


    return (
      <>
        <ul id="result_list" className='flex flex-wrap mb-2 gap-2'>
          {/* Render existing results */}
          {collapsedResults.sort((a, b) => a.fields.label[0][0].localeCompare(b.fields.label[0][0], 'no')).map((hit, index) => {
            const isSelected = highlightedGroup == stringToBase64Url(hit.fields?.['group.id']?.[0])
            return (
           
           <li key={hit._id}>
           <Clickable
             link 
             aria-current={isSelected ? 'page' : undefined}
             onClick={() => setHighlightedGroup(stringToBase64Url(hit.fields?.['group.id']?.[0]))}
             className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 no-underline
               ${isSelected 
                 ? 'bg-accent-50 text-accent-900 border border-accent-800 shadow-sm' 
                 : 'bg-neutral-50 text-neutral-800 border border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300 hover:shadow-sm'
               }`}
             add={{
               group: stringToBase64Url(hit.fields?.['group.id']?.[0])
             }}>
             <span className="font-bold text-lg">{hit.fields.label[0][0].toUpperCase()}</span>
             
               <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                 ${isSelected 
                   ? 'bg-accent-800 text-white' 
                   : 'bg-neutral-200'
                 }`}>
                 {hit.inner_hits?.group?.hits?.total?.value}
               </span>
             
           </Clickable>
         </li>
            )
          })}
          
          {/* Render loading skeletons */}
          {(isLoading || isLoadingResults) && Array.from({length: PER_PAGE}).map((_, i) => (
            <div className="flex flex-wrap mb-2 gap-2" key={`skeleton-${collapsedResults.length + i}`}>
              <div 
                className="rounded-md bg-neutral-900/10 animate-pulse h-12"
                style={{width: `${getSkeletonLength(i, 4, 8)}rem`}}
              ></div>
            </div>
          ))}
          

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
