'use client'
 
import { createContext } from 'react'
import { useState, useEffect } from 'react';
import { ResultData } from './types'
import { useParams } from 'next/navigation'
import { useQueryStringWithout } from '@/lib/search-params';

interface SearchContextData {
    resultData: ResultData | null;
    isLoading: boolean;
    mapBounds?: [number, number][];
  }
 
  export const SearchContext = createContext<SearchContextData>({
    resultData: null,
    isLoading: false,
    mapBounds: [],
  });

 
export default function SearchProvider({ children }: {  children: React.ReactNode }) {
    const [resultData, setResultData] = useState<ResultData | null>(null);
    const [isLoading, setIsLoading] = useState(false)
    const [mapBounds, setMapBounds] = useState<[number, number][]>([]);
    const params = useParams()
    const searchParams = useQueryStringWithout(['docs'])

    useEffect(() => {
        if (searchParams?.length) {
            console.log("PARAMS", searchParams)
            setIsLoading(true)
            console.log("FETCHING ", `/api/search?dataset=${params.dataset}&${searchParams}`)
            fetch(`/api/search?dataset=${params.dataset}&${searchParams}`).then(response => response.json()).then(es_data => {
            if (es_data.aggregations?.viewport?.bounds) {
                setMapBounds([[es_data.aggregations.viewport.bounds.top_left.lat, es_data.aggregations.viewport.bounds.top_left.lon],
                    [es_data.aggregations.viewport.bounds.bottom_right.lat, es_data.aggregations.viewport.bounds.bottom_right.lon]])
            }
            else {
                setMapBounds([])
            }
            setResultData(es_data)
    
            }).then(() => setIsLoading(false))
        }
      }, [searchParams, params.dataset])

  return <SearchContext.Provider value={{resultData, isLoading, mapBounds}}>{children}</SearchContext.Provider>
}




