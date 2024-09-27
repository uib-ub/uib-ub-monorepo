'use client'
import { createContext } from 'react'
import { useState, useEffect } from 'react';
import { ResultData } from './types'
import { useSearchQuery } from '@/lib/search-params';

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
    const { searchQueryString } = useSearchQuery()



    useEffect(() => {
            setIsLoading(true)

            fetch(`/api/search?${searchQueryString}`)
                .then(response => response.json())
                .then(es_data => {

            if (es_data.error)  {
                setSearchError(es_data)
                return
            }

            setResultData(es_data)

            }).then(() => setIsLoading(false)).catch(error => {
                setSearchError({error})
            })
        
        
      }, [searchQueryString])

  return <SearchContext.Provider value={{resultData, isLoading, searchError}}>{children}</SearchContext.Provider>
}




