'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
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
    childrenBounds: number[][] | null;
    groupedAndFilteredChildren: Record<string, any[]> | null;
    childrenCount: number;
    shownChildrenCount: number;
  }
 
export const ChildrenContext = createContext<ChildrenContextData>({
    childrenData: null,
    childrenLoading: false,
    childrenError: null,
    childrenBounds: null,
    groupedAndFilteredChildren: null,
    childrenCount: 0,
    shownChildrenCount: 0
    });


export default function ChildrenProvider({ children }: {  children: React.ReactNode }) {
    const dataset = useDataset()
    const { parentData, parentLoading, docData, setSameMarkerList } = useContext(DocContext)
    const [childrenData, setChildrenData] = useState<Record<string, any>[] | null>(null)
    const [childrenLoading, setChildrenLoading] = useState(false)
    const [shownChildrenCount, setShownChildrenCount] = useState(0)
    const [childrenCount, setChildrenCount] = useState(0)
    const [childrenError, setChildrenError] = useState<Record<string, string> | null>(null)
    const [groupedAndFilteredChildren, setGroupedAndFilteredChildren] = useState<Record<string, any[]> | null>(null)
    const searchParams = useSearchParams()
    const isTable = searchParams.get('mode') == 'table'
    const asc = searchParams.get('asc')
    const desc = searchParams.get('desc')
    const page = useQueryState('page', parseAsInteger.withDefault(1))[0]
    const perPage = useQueryState('perPage', parseAsInteger.withDefault(10))[0]
    const [childrenBounds, setChildrenBounds] = useState<number[][] | null>(null)

    const parent = searchParams.get('parent')
    const doc = searchParams.get('doc')
    const mode = searchParams.get('mode') || 'map'
    const sourceLabel = searchParams.get('sourceLabel')
    const sourceDataset = searchParams.get('sourceDataset')
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
                        setChildrenBounds(paddedBounds)
                    }

                }
            }).catch(error => {
                console.error(error)
                setChildrenError({error: error.statusText, status: error.status})
            }).finally(() => {
                setChildrenLoading(false)
            })
        }
    }, [parentData, isTable, asc, desc, page, perPage, setChildrenBounds, parent, dataset, isMobile])


    // Clear children bounds when parent changes
    useEffect(() => {
        setChildrenBounds(null)
    }, [parent])
    


    useEffect(() => {
        if (dataset != 'search') return;
    
        if (!parentLoading && parentData?._source?.children && parentData._source.uuid == parent) {
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
                setChildrenCount(es_data.hits.hits.length)
                if (isTable) {
                    setChildrenData(es_data.hits.hits)
                }
                else {
                    const newBounds = es_data.aggregations?.viewport.bounds
                    setChildrenData(es_data.hits.hits)

                    if (newBounds?.top_left && newBounds?.bottom_right) {
                        console.log("SET CHILDREN BOUNDS", parent, parentData._source.uuid, newBounds)
                        const paddedBounds = addPadding([[newBounds.top_left.lat, newBounds.top_left.lon], [newBounds.bottom_right.lat, newBounds.bottom_right.lon]], isMobile)
                        setChildrenBounds(paddedBounds)
                    }

                }
                
                        
            }).catch(error => {
                console.error(error)
                setChildrenError({error: error.statusText, status: error.status})

            }).finally(() => {
                setChildrenLoading(false)
            })

        }
 

    }, [parentData, parentLoading, isTable, asc, desc, page, perPage, setChildrenBounds, dataset, isMobile, mode, parent])
    

    const filterAndGroupChildren = useCallback((data: any[]) => {
        const matchingChildren = data.filter((doc: any) => {
            if (sourceLabel && !([doc._source?.label, ...(doc._source?.altLabels || []), ...(doc._source?.attestations?.map((a: any) => a.label) || [])].includes(sourceLabel))) return false;
            if (sourceDataset && !doc._index.includes(sourceDataset)) return false;
            return true;
        });

        setShownChildrenCount(matchingChildren.length);

        const filtered: Record<string, Record<string, any>[]> = Object.fromEntries(Object.entries(
            matchingChildren
                .reduce((acc: Record<string, Record<string, any>[]>, doc: Record<string, any>) => {
                    const index = doc._index.split('-')[2]
                    if (!acc[index]) acc[index] = []
                    acc[index].push(doc)
                    return acc
                }, {})
        ));
        
        setGroupedAndFilteredChildren(filtered);
    }, [sourceLabel, sourceDataset]);

    useEffect(() => {
        if (!childrenData?.length || dataset != 'search') return;
        filterAndGroupChildren(childrenData);
    }, [filterAndGroupChildren, childrenData, dataset]);
    

    
    useEffect(() => {
        if (parent && doc != parent && docData?._source?.location?.coordinates?.length == 2 && childrenData?.length) {
            const currentCoordinates = docData._source.location.coordinates
            const sameCoordinates = childrenData.filter((child: Record<string, any>) => child.fields?.location?.[0]?.coordinates?.every((coord: number, index: number) => coord == currentCoordinates[index]))
            if (sameCoordinates.length > 1) {
                setSameMarkerList(sameCoordinates)
            }
            
        }
    }, [parent, docData, childrenData, doc, setSameMarkerList])



    return <ChildrenContext.Provider value={{
        childrenData,
        childrenLoading,
        childrenError,
        childrenBounds,
        groupedAndFilteredChildren,
        childrenCount,
        shownChildrenCount

  }}>{children}</ChildrenContext.Provider>
}




