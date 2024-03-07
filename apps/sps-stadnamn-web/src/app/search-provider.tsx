'use client'
 
import { createContext } from 'react'
import { useState, useEffect } from 'react';
import { ResultData } from './types'
import { useParams } from 'next/navigation'
import { useQueryStringWithout } from '@/lib/search-params';

interface SearchContextData {
    resultData: ResultData | null;
    isLoading: boolean;
  }
 
  export const SearchContext = createContext<SearchContextData>({
    resultData: null,
    isLoading: false,
  });
 
export default function SearchProvider({ children }: {  children: React.ReactNode }) {
    const [resultData, setResultData] = useState<ResultData | null>(null);
    const [isLoading, setIsLoading] = useState(false)
    const params = useParams()
    const searchParams = useQueryStringWithout(['docs'])

    useEffect(() => {
        if (searchParams?.length) {
            console.log("PARAMS", searchParams)
            setIsLoading(true)
            console.log("FETCHING ", `/api/search?dataset=${params.dataset}&${searchParams}`)
            fetch(`/api/search?dataset=${params.dataset}&${searchParams}`).then(response => response.json()).then(es_data => {
            setResultData(es_data)
    
            }).then(() => setIsLoading(false))
        }
      }, [searchParams, params.dataset])

  return <SearchContext.Provider value={{resultData, isLoading}}>{children}</SearchContext.Provider>
}




