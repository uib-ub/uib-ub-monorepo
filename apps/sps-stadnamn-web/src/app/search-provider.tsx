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
    isLoading: true,
    mapBounds: []
    });

 
export default function SearchProvider({ children }: {  children: React.ReactNode }) {
    const [resultData, setResultData] = useState<ResultData | null>(null);
    const [isLoading, setIsLoading] = useState(true)
    const [mapBounds, setMapBounds] = useState<[number, number][]>([]);
    const params = useParams()
    const filteredSearchParams = useQueryStringWithout(['docs'])

    useEffect(() => {

            setIsLoading(true)
            //console.log("FETCHING ", `/api/search?dataset=${params.dataset}${filteredSearchParams ? '&' + filteredSearchParams : ''}`)
            fetch(`/api/search?dataset=${params.dataset}${filteredSearchParams ? '&' + filteredSearchParams : ''}`)
                .then(response => response.json())
                .then(es_data => {

            if (es_data.aggregations?.viewport?.bounds) {
                setMapBounds([[es_data.aggregations.viewport.bounds.top_left.lat, es_data.aggregations.viewport.bounds.top_left.lon],
                    [es_data.aggregations.viewport.bounds.bottom_right.lat, es_data.aggregations.viewport.bounds.bottom_right.lon]])
            }
            else {
                setMapBounds([])
            }
            setResultData(es_data)

            }).then(() => setIsLoading(false))
        
        
      }, [filteredSearchParams, params.dataset])

  return <SearchContext.Provider value={{resultData, isLoading, mapBounds}}>{children}</SearchContext.Provider>
}




