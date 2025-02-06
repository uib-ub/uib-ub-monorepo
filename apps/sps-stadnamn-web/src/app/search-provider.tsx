'use client'
import { createContext, useContext } from 'react'
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
  }
 
  export const SearchContext = createContext<SearchContextData>({
    resultData: null,
    tableData: null,
    isLoading: true,
    searchError: null,
    totalHits: null,
    resultBounds: null,
    });

 
export default function SearchProvider({ children }: {  children: React.ReactNode }) {
    const [resultData, setResultData] = useState<any[] | null>(null)
    const [tableData, setTableData] = useState<any[] | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [totalHits, setTotalHits] = useState<Record<string,any> | null>(null)

    

    const { setCurrentUrl, isMobile, pinnedFilters } = useContext(GlobalContext)
    

    const [resultBounds, setResultBounds] = useState<[[number, number], [number, number]] | null>(null)

    const [searchError, setSearchError] = useState<Record<string, any> | null>(null)
    const { searchQueryString, searchFilterParamsString, size } = useSearchQuery()

    const searchParams = useSearchParams()
    const isTable = searchParams.get('mode') == 'table' || searchParams.get('mode') == 'list'
    const asc = searchParams.get('asc')
    const desc = searchParams.get('desc')
    const page = useQueryState('page', parseAsInteger.withDefault(1))[0]
    const perPage = useQueryState('perPage', parseAsInteger.withDefault(10))[0]
    const router = useRouter()

    const dataset = useDataset()
    const searchParamsString = searchParams.toString()

    useEffect(() => {
        
        if (pinnedFilters[dataset]?.length > 0 && !searchFilterParamsString) {
            const newParams = new URLSearchParams(searchParams)
            const pinnedParams = new URLSearchParams(pinnedFilters[dataset])
            router.replace(`?${newParams.toString()}${newParams.toString() ? '&' : ''}${pinnedParams.toString()}`, { scroll: false })
        }
    }, [dataset, pinnedFilters, searchFilterParamsString, router, searchParams]);


    
    useEffect(() => {
        setCurrentUrl("/search?" + searchParamsString)
    }, [searchParamsString])
    



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
                    // Temporary fix for null island and similar errors
                    let limitedBounds = [
                      [newBounds.top_left.lat, Math.min(newBounds.top_left.lon, 33)], // East of Murmansk ~33°E
                      [Math.max(newBounds.bottom_right.lat, 55.6), newBounds.bottom_right.lon] // South of Copenhagen ~55.6°N
                    ] as [[number, number], [number, number]]

                    // Calculate bounds based on zoom level if bounds are a single point
                    if (limitedBounds[0][0] === limitedBounds[1][0] && limitedBounds[0][1] === limitedBounds[1][1]) {
                      // At zoom level 11, each degree is approximately 0.1 degrees
                      const offset = 0.1;
                      limitedBounds = [
                        [limitedBounds[0][0] + offset, limitedBounds[0][1] - offset],
                        [limitedBounds[1][0] - offset, limitedBounds[1][1] + offset]
                      ]
                    }
                    
                    setResultBounds(limitedBounds)
                }
                else {
                    setResultBounds([[72, -5], [54, 25]])
                }

            }
            
                    
        }).catch(error => {
            console.error(error)
            setSearchError({error: error.statusText, status: error.status})

        }).finally(() => {
            setIsLoading(false)
        })
        
        
      }, [searchQueryString, size, searchFilterParamsString, isTable, asc, desc, page, perPage, isMobile])


  return <SearchContext.Provider value={{resultData, resultBounds, totalHits, isLoading, searchError, tableData}}>{children}</SearchContext.Provider>
}




