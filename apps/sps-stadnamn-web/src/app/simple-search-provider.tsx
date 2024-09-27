'use client'
import { createContext } from 'react'
import { useState, useEffect } from 'react';
import { ResultData } from './types'
import { useParams, useSearchParams } from 'next/navigation'
import { useQueryStringWithout } from '@/lib/search-params';

interface SearchContextData {
    resultData: ResultData | null;
    isLoading: boolean;
    searchError: Record<string, string> | null;
  }
 
  export const SearchContext = createContext<SearchContextData>({
    resultData: null,
    isLoading: true,
    searchError: null,
    });

 
export default function SearchProvider({ children }: {  children: React.ReactNode }) {
    const [resultData, setResultData] = useState<ResultData | null>(null);
    const [isLoading, setIsLoading] = useState(true)

    const [searchError, setSearchError] = useState<Record<string, any> | null>(null)
    const searchParams = useSearchParams()

    const searchUpdate = useQueryStringWithout(['docs', 'popup', 'search', 'expanded', 'zoom', 'center']) // Props not passed to the search API






    useEffect(() => {

            setIsLoading(true)

            fetch(`/api/search?${searchUpdate}`)
                .then(response => response.json())
                .then(es_data => {

            if (es_data.error)  {
                setSearchError(es_data)
                return
            }
            console.log("DATA", es_data)
            setResultData(es_data)

            }).then(() => setIsLoading(false)).catch(error => {
                setSearchError({error})
            })
        
        
      }, [searchUpdate])

  return <SearchContext.Provider value={{resultData, isLoading, searchError}}>{children}</SearchContext.Provider>
}




