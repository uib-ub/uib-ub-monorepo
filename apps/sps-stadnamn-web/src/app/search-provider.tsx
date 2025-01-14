'use client'
import { createContext, useContext, useRef } from 'react'
import { useState, useEffect } from 'react';
import { useDataset, useSearchQuery } from '@/lib/search-params';
import { parseAsInteger, useQueryState } from 'nuqs';
import { useRouter, useSearchParams } from 'next/navigation';
import { GlobalContext } from './global-provider';
import { addPadding } from '@/lib/map-utils';

interface SearchContextData {
    resultData: any;
    tableData: any;
    isLoading: boolean;
    searchError: Record<string, string> | null;
    totalHits: Record<string, any> | null;
    resultBounds: [[number, number], [number, number]] | null;
    setResultBounds: (bounds: [[number, number], [number, number]] | null) => void;
  }
 
  export const SearchContext = createContext<SearchContextData>({
    resultData: null,
    tableData: null,
    isLoading: true,
    searchError: null,
    totalHits: null,
    resultBounds: null,
    setResultBounds: () => {}
    });

 
export default function SearchProvider({ children }: {  children: React.ReactNode }) {
    const [resultData, setResultData] = useState<any[] | null>(null)
    const [tableData, setTableData] = useState<any[] | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [totalHits, setTotalHits] = useState<Record<string,any> | null>(null)

    

    const { setCurrentUrl, isMobile, pinnedFilters } = useContext(GlobalContext)
    

    const [resultBounds, setResultBounds] = useState<[[number, number], [number, number]] | null>(null)

    const [searchError, setSearchError] = useState<Record<string, any> | null>(null)
    const { searchQueryString, searchFilterParamsString, size, facetFilters } = useSearchQuery()

    const searchParams = useSearchParams()
    const isTable = searchParams.get('mode') == 'table' || searchParams.get('mode') == 'list'
    const asc = searchParams.get('asc')
    const desc = searchParams.get('desc')
    const page = useQueryState('page', parseAsInteger.withDefault(1))[0]
    const perPage = useQueryState('perPage', parseAsInteger.withDefault(10))[0]
    const router = useRouter()

    const dataset = useDataset()

    useEffect(() => {
        
        if (pinnedFilters[dataset]?.length > 0 && !searchFilterParamsString) {
            const newParams = new URLSearchParams(searchParams)
            const pinnedParams = new URLSearchParams(pinnedFilters[dataset])
            router.replace(`?${newParams.toString()}${newParams.toString() ? '&' : ''}${pinnedParams.toString()}`, { scroll: false })
        }
    }, [dataset, pinnedFilters, searchFilterParamsString, router, searchParams]);


    useEffect(() => {
        setCurrentUrl("/search?" + searchParams.toString())
    }, [searchParams, setCurrentUrl])



    useEffect(() => {
        setIsLoading(true)
        let url
        if (isTable) {
            url = `/api/search/table?size=${perPage}${searchQueryString ? `&${searchQueryString}`: ''}${desc ? `&desc=${desc}`: ''}${asc ? `&asc=${asc}` : ''}${page > 1 ? `&from=${(page-1)*perPage}`: ''}`
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
                if (newBounds?.top_left && newBounds?.bottom_right) {
                    const paddedBounds = addPadding([[newBounds.top_left.lat, newBounds.top_left.lon], [newBounds.bottom_right.lat, newBounds.bottom_right.lon]], isMobile)
                    setResultBounds(paddedBounds)
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
        
        
      }, [searchQueryString, size, searchFilterParamsString, isTable, asc, desc, page, perPage, isMobile])


  return <SearchContext.Provider value={{resultData, resultBounds, totalHits, isLoading, searchError, tableData, setResultBounds}}>{children}</SearchContext.Provider>
}




