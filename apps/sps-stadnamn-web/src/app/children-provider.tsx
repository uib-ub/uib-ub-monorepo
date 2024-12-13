'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation';
import { useDataset } from '@/lib/search-params';
import { parseAsInteger } from 'nuqs';
import { useQueryState } from 'nuqs';
import { SearchContext } from './search-provider';


interface ChildrenContextData {
    childrenData: any;
    childrenLoading: boolean;
    childrenError: Record<string, string> | null;
    
  }
 
export const ChildrenContext = createContext<ChildrenContextData>({
    childrenData: null,
    childrenLoading: true,
    childrenError: null,
    });


export default function ChildrenProvider({ children }: {  children: React.ReactNode }) {


    const dataset = useDataset()
    
    const [childrenData, setChildrenData] = useState<any>(null)
    const [childrenLoading, setChildrenLoading] = useState(true)
    const [childrenError, setChildrenError] = useState<Record<string, string> | null>(null)
    const searchParams = useSearchParams()
    const isTable = searchParams.get('mode') == 'table'
    const asc = searchParams.get('asc')
    const desc = searchParams.get('desc')
    const page = useQueryState('page', parseAsInteger.withDefault(1))[0]
    const perPage = useQueryState('perPage', parseAsInteger.withDefault(10))[0]
    const { setResultBounds } = useContext(SearchContext)

    const parent = searchParams.get('parent')
    



    useEffect(() => {

        if (!parent) {
            setChildrenData(null)
            setChildrenLoading(false)
            return
        }

        setChildrenLoading(true)    
        const query = dataset == 'search' ? `dataset=*&snid=${parent}` : `dataset=${dataset}&within=${parent}`    
        
        let url = "/api/search/"
        if (isTable) {
            url += `table?size=${perPage}&${query}${desc ? `&desc=${desc}`: ''}${asc ? `&asc=${asc}` : ''}${page > 1 ? `&from=${(page-1)*perPage}`: ''}`
        }
        else {
            url += `map?${query}&size=1000`
        }
        
        fetch(url)
        .then(response => {
            if (!response.ok) {
                throw response
            }
            return response.json()})
        .then(es_data => {
            
            if (isTable) {
                setChildrenData(es_data.hits.hits)
            }
            else {
                const newBounds = es_data.aggregations?.viewport.bounds
                setChildrenData(es_data.hits.hits)

                if (newBounds) {
                    setResultBounds([[newBounds.top_left.lat, newBounds.top_left.lon], [newBounds.bottom_right.lat, newBounds.bottom_right.lon]])
                }
                else {
                    setResultBounds(null)
                }

            }
            
                    
        }).catch(error => {
            console.error(error)
            setChildrenError({error: error.statusText, status: error.status})

        }).finally(() => {
            setChildrenLoading(false)
        })
        
        
        
      }, [isTable, asc, desc, page, perPage, setResultBounds, parent, dataset])



    return <ChildrenContext.Provider value={{
        childrenData,
        childrenLoading,
        childrenError

  }}>{children}</ChildrenContext.Provider>
}




