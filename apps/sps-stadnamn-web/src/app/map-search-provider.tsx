'use client'
import { createContext, useRef } from 'react'
import { useState, useEffect } from 'react';
import { ResultData } from './types'
import { useSearchQuery } from '@/lib/search-params';
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
    const resultData = useRef<any[] | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const searchParams = useSearchParams()
    const prevQuery = useRef<string | null>(null)
    const [totalHits, setTotalHits] = useState<Record<string,any> | null>(null)

    const [resultBounds, setResultBounds] = useState<[[number, number], [number, number]] | null>(null)

    const [searchError, setSearchError] = useState<Record<string, any> | null>(null)
    const { searchQueryString } = useSearchQuery()

    const from = searchParams.get('from')
    const size = searchParams.get('size')


    useEffect(() => {
            //setIsLoading(true)
            const newQuery = new URLSearchParams(searchQueryString)
            console.log("QUERYING", prevQuery?.current, searchQueryString, from, size)

            /*
            if (prevQuery?.current == searchQueryString && resultData?.current?.length == parseInt(from || '0') + parseInt(size || '20')) {
                setIsLoading(false)
                return

            }
                */
            
            if (prevQuery?.current == searchQueryString && from && size) {
                console.log("SETTING SIZE")
                newQuery.set('from', from)
                newQuery.set('size', size)
            }
            else {
                newQuery.set('size', (parseInt(size || '20') + parseInt(from || '0')).toString())
                setIsLoading(true)
            }

            
            fetch(`/api/search/map?${newQuery.toString()}`)
            .then(response => response.json())
            .then(es_data => {

            if (es_data.error)  {
                setSearchError(es_data)
                return
            }

            // Append new data to existing data if from is set and previous query is the same
            if (prevQuery?.current == searchQueryString && from && resultData?.current?.length == parseInt(from)) {
                console.log("APPENDING DATA", resultData.current.length, es_data.hits.hits.length)
                resultData.current = [...resultData.current, ...es_data.hits.hits]
                console.log("NEW LENGTH", resultData.current.length)

            }
            else {
                console.log("CHANGING VIEWPORT")
                const newBounds = es_data.aggregations?.viewport.bounds
                setResultBounds([[newBounds.top_left.lat, newBounds.top_left.lon], [newBounds.bottom_right.lat, newBounds.bottom_right.lon]])

                setTotalHits(es_data.hits.total)
                setIsLoading(false)
                prevQuery.current = searchQueryString
                resultData.current = es_data.hits.hits
            }

            }).catch(error => {
                setSearchError({error})
            })

      }, [searchQueryString, from, size])

      

  return <SearchContext.Provider value={{resultData, resultBounds, totalHits, isLoading, searchError}}>{children}</SearchContext.Provider>
}




