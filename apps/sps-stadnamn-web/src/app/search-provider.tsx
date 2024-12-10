'use client'
import { createContext, useContext, useRef } from 'react'
import { useState, useEffect } from 'react';
import { useSearchQuery } from '@/lib/search-params';
import { useQueryState } from 'nuqs';
import { useSearchParams } from 'next/navigation';
import { GlobalContext } from './global-provider';

interface SearchContextData {
    resultData: any;
    tableData: any;
    isLoading: boolean;
    searchError: Record<string, string> | null;
    totalHits: Record<string, any> | null;
    resultBounds: [[number, number], [number, number]] | null;
    mapInstance: any;
  }
 
  export const SearchContext = createContext<SearchContextData>({
    resultData: null,
    tableData: null,
    isLoading: true,
    searchError: null,
    totalHits: null,
    resultBounds: null,
    mapInstance: null
    });

 
export default function SearchProvider({ children }: {  children: React.ReactNode }) {
    const [resultData, setResultData] = useState<any[] | null>(null)
    const [tableData, setTableData] = useState<any[] | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [totalHits, setTotalHits] = useState<Record<string,any> | null>(null)
    const mapInstance = useRef<any>(null);

    const { setCurrentUrl} = useContext(GlobalContext)
    

    const [resultBounds, setResultBounds] = useState<[[number, number], [number, number]] | null>(null)

    const [searchError, setSearchError] = useState<Record<string, any> | null>(null)
    const { searchQueryString, searchFilterParamsString, size } = useSearchQuery()

    const searchParams = useSearchParams()
    
    const isTable = useSearchParams().get('mode') == 'table'

    useEffect(() => {
        setCurrentUrl("/search?" + searchParams.toString())
    }, [searchParams])


    useEffect(() => {
        setIsLoading(true)
        let url
        if (isTable) {
            url = `/api/search/table?${searchQueryString}&size=${size}`
        }
        else {
            url = `/api/search/map?${searchQueryString}&size=${size}`
        }
        
        fetch(url)
        .then(response => {
            if (!response.ok) {
                throw response
            }
            return response.json()})
        .then(es_data => {
            
            if (isTable) {
                setTableData(es_data.hits.hits)
                setTotalHits(es_data.hits.total)
            }
            else {
                const newBounds = es_data.aggregations?.viewport.bounds
                setResultData(es_data.hits.hits)
                setTotalHits(es_data.hits.total)
                if (newBounds) {
                    setResultBounds([[newBounds.top_left.lat, newBounds.top_left.lon], [newBounds.bottom_right.lat, newBounds.bottom_right.lon]])
                }
                else {
                    setResultBounds(null)
                }

            }
            
                    
        }).catch(error => {
            console.error(error)
            setSearchError({error: error.statusText, status: error.status})

        }).finally(() => {
            setIsLoading(false)
        })
        
        
      }, [searchQueryString, size, searchFilterParamsString, isTable])


  return <SearchContext.Provider value={{resultData, resultBounds, totalHits, isLoading, searchError, mapInstance, tableData}}>{children}</SearchContext.Provider>
}




