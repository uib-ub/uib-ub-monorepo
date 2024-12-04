'use client'
import { createContext } from 'react'
import { useState, useEffect } from 'react';
import { useSearchQuery } from '@/lib/search-params';
import { useQueryState } from 'nuqs';
import { useSearchParams } from 'next/navigation';

interface SearchContextData {
    resultData: any;
    isLoading: boolean;
    searchError: Record<string, string> | null;
    totalHits: Record<string, any> | null;
    resultBounds: [[number, number], [number, number]] | null;
  }
 
  export const SearchContext = createContext<SearchContextData>({
    resultData: null,
    isLoading: true,
    searchError: null,
    totalHits: null,
    resultBounds: null
    });

 
export default function SearchProvider({ children }: {  children: React.ReactNode }) {
    const [resultData, setResultData] = useState<any[] | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [totalHits, setTotalHits] = useState<Record<string,any> | null>(null)

    const [resultBounds, setResultBounds] = useState<[[number, number], [number, number]] | null>(null)

    const [searchError, setSearchError] = useState<Record<string, any> | null>(null)
    const { searchQueryString, searchFilterParamsString, size } = useSearchQuery()
    
    const isTable = useSearchParams().get('mode') == 'table'


    useEffect(() => {
        setIsLoading(true)
        fetch(`/api/search/${isTable ? 'table' : 'map'}?${searchQueryString}&size=${size}`)
        .then(response => {
            if (!response.ok) {
                throw response
            }
            return response.json()})
        .then(es_data => {

            const newBounds = es_data.aggregations?.viewport.bounds
            if (newBounds) {
                setResultBounds([[newBounds.top_left.lat, newBounds.top_left.lon], [newBounds.bottom_right.lat, newBounds.bottom_right.lon]])
            }
            else {
                setResultBounds(null)
            }
            


            setTotalHits(es_data.hits.total)
            setResultData(es_data.hits.hits)
                    
        }).catch(error => {
            console.error(error)
            setSearchError({error: error.statusText, status: error.status})

        }).finally(() => {
            setIsLoading(false)
        })
        
      }, [searchQueryString, size, searchFilterParamsString, isTable])


  return <SearchContext.Provider value={{resultData, resultBounds, totalHits, isLoading, searchError}}>{children}</SearchContext.Provider>
}




