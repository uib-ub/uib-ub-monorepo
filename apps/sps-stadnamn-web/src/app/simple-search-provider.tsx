'use client'
import { createContext, useRef } from 'react'
import { useState, useEffect } from 'react';
import { ResultData } from './types'
import { useSearchQuery } from '@/lib/search-params';
import { useSearchParams } from 'next/navigation';

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
    const resultData = useRef<ResultData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const searchParams = useSearchParams()
    const prevQuery = useRef<string | null>(null)

    const [searchError, setSearchError] = useState<Record<string, any> | null>(null)
    const { searchQueryString } = useSearchQuery()

    const from = searchParams.get('from')
    const size = searchParams.get('size')


    useEffect(() => {
            setIsLoading(true)
            console.log("SEARCHING", searchQueryString, from, size)
            const newQuery = new URLSearchParams(searchQueryString)

            if (prevQuery?.current == searchQueryString && resultData?.current?.hits.hits.length == parseInt(from || '0') + parseInt(size || '20')) {
                setIsLoading(false)
                return

            }
            
            
            if (prevQuery?.current == searchQueryString && from && size) {
                newQuery.set('from', from)
                newQuery.set('size', size)
                console.log("PREPARE APPEND")
                console.log("NEW QUERY", newQuery.toString())
            }
            else {
                console.log("DEFAULT")
                newQuery.set('size', (parseInt(size || '20') + parseInt(from || '0')).toString())
                console.log("NEW QUERY", newQuery.toString())
            }

            
            fetch(`/api/search?${newQuery.toString()}`)
            .then(response => response.json())
            .then(es_data => {

            if (es_data.error)  {
                setSearchError(es_data)
                return
            }

            // Append new data to existing data if from is set and previous query is the same
            console.log(newQuery.toString())
            if (prevQuery?.current == searchQueryString && from && resultData.current) {
                resultData.current = {
                    ...resultData.current,
                    hits: {
                        ...resultData.current.hits,
                        hits: [
                            ...resultData.current.hits.hits,
                            ...es_data.hits.hits
                        ]
                    }
                }
                prevQuery.current = searchQueryString

            }
            else {
                resultData.current = es_data
            }
                
    
 
            

            }).then(() => setIsLoading(false)).catch(error => {
                setSearchError({error})
            })

      }, [searchQueryString, from, size])

      

  return <SearchContext.Provider value={{resultData: resultData.current, isLoading, searchError}}>{children}</SearchContext.Provider>
}




