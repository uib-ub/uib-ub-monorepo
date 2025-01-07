'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation';
import { useDataset } from '@/lib/search-params';
import { parseAsInteger } from 'nuqs';
import { useQueryState } from 'nuqs';
import { SearchContext } from './search-provider';
import { DocContext } from './doc-provider';
import { GlobalContext } from './global-provider';
import { addPadding } from '@/lib/map-utils';


interface ChildrenContextData {
    childrenData: any;
    childrenLoading: boolean;
    childrenError: Record<string, string> | null;
    
  }
 
export const ChildrenContext = createContext<ChildrenContextData>({
    childrenData: null,
    childrenLoading: false,
    childrenError: null,
    });


export default function ChildrenProvider({ children }: {  children: React.ReactNode }) {

    


    const dataset = useDataset()

    const { parentData, parentLoading, docData, setSameMarkerList } = useContext(DocContext)
    
    const [childrenData, setChildrenData] = useState<any>(null)
    const [childrenLoading, setChildrenLoading] = useState(false)
    const [childrenError, setChildrenError] = useState<Record<string, string> | null>(null)
    const searchParams = useSearchParams()
    const isTable = searchParams.get('mode') == 'table'
    const asc = searchParams.get('asc')
    const desc = searchParams.get('desc')
    const page = useQueryState('page', parseAsInteger.withDefault(1))[0]
    const perPage = useQueryState('perPage', parseAsInteger.withDefault(10))[0]
    const { setResultBounds } = useContext(SearchContext)

    const parent = searchParams.get('parent')
    const doc = searchParams.get('doc')
    const mode = searchParams.get('mode') || 'map'
    const { isMobile } = useContext(GlobalContext)


    useEffect(() => {
        if (parent && dataset != 'search') {
            setChildrenLoading(true)
            const query = `dataset=${dataset}&within=${parent}`
            const url = `/api/search/map?${query}&size=1000`
            
            fetch(url).then(response => {
                if (!response.ok) {
                    throw response
                }
                return response.json()
            }).then(data => {
                if (isTable) {
                    setChildrenData(data.hits.hits)
                }
                else {
                    const newBounds = data.aggregations?.viewport.bounds
                    setChildrenData(data.hits.hits)
                    if (newBounds?.top_left && newBounds?.bottom_right) {
                        const paddedBounds = addPadding([[newBounds.top_left.lat, newBounds.top_left.lon], [newBounds.bottom_right.lat, newBounds.bottom_right.lon]], isMobile)
                        setResultBounds(paddedBounds)
                    }

                }
            }).catch(error => {
                console.error(error)
                setChildrenError({error: error.statusText, status: error.status})
            }).finally(() => {
                setChildrenLoading(false)
            })
        }
    }, [parentData, isTable, asc, desc, page, perPage, setResultBounds, parent, dataset, isMobile])
    


    useEffect(() => {

        if (!parentLoading && parentData?._source?.children) {
            setChildrenLoading(true)            
            fetch("/api/children?", {
                method: 'POST',
                body: JSON.stringify({children: parentData._source.children, mode})
            })
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

                    if (newBounds?.top_left && newBounds?.bottom_right) {
                        const paddedBounds = addPadding([[newBounds.top_left.lat, newBounds.top_left.lon], [newBounds.bottom_right.lat, newBounds.bottom_right.lon]], isMobile)
                        setResultBounds(paddedBounds)
                    }

                }
                
                        
            }).catch(error => {
                console.error(error)
                setChildrenError({error: error.statusText, status: error.status})

            }).finally(() => {
                setChildrenLoading(false)
            })

        }
 

    }, [parentData, parentLoading, isTable, asc, desc, page, perPage, setResultBounds, dataset, isMobile, mode])
    

    

    
    useEffect(() => {
        if (parent && doc != parent && docData?._source?.location?.coordinates?.length == 2 && childrenData?.length) {
            const currentCoordinates = docData._source.location.coordinates
            const sameCoordinates = childrenData.filter((child: Record<string, any>) => child.fields?.location?.[0]?.coordinates?.every((coord: number, index: number) => coord == currentCoordinates[index]))
            if (sameCoordinates.length > 1) {
                setSameMarkerList(sameCoordinates)
            }
            
        }
    }, [parent, docData, childrenData, doc])




    return <ChildrenContext.Provider value={{
        childrenData,
        childrenLoading,
        childrenError

  }}>{children}</ChildrenContext.Provider>
}




