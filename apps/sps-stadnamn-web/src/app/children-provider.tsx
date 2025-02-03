'use client'
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation';
import { useDataset } from '@/lib/search-params';
import { parseAsInteger } from 'nuqs';
import { useQueryState } from 'nuqs';
import { SearchContext } from './search-provider';
import { DocContext } from './doc-provider';
import { GlobalContext } from './global-provider';
import { addPadding } from '@/lib/map-utils';
import { treeSettings } from '@/config/server-config';
import { groupSameCoordinates } from '@/lib/map-utils';
import { request } from 'http';


interface ChildrenContextData {
    childrenData: any[] | null;
    sourceChildren: Record<string, any[]> | null;
    childrenMarkers: any[] | null;
    childrenLoading: boolean;
    childrenError: Record<string, string> | null;
    childrenBounds: number[][] | null;
    childrenCount: number;
    shownChildrenCount: number;
  }
 
export const ChildrenContext = createContext<ChildrenContextData>({
    childrenData: null,
    sourceChildren: null,
    childrenMarkers: null,
    childrenLoading: false,
    childrenError: null,
    childrenBounds: null,
    childrenCount: 0,
    shownChildrenCount: 0,
    });



export default function ChildrenProvider({ children }: {  children: React.ReactNode }) {
    const dataset = useDataset()
    const { parentData, parentLoading, docData, setSameMarkerList } = useContext(DocContext)
    const { isMobile } = useContext(GlobalContext)
    
    const childrenData = useRef<Record<string, any>[] | null>(null) // Ungrouped
    const filteredChildren = useRef<Record<string, any>[] | null>(null) // Filtered client side
    const [sourceChildren, setSourceChildren] = useState<Record<string, Record<string, any>[]> | null>(null) // Filtered and grouped by dataset
    const [childrenMarkers, setChildrenMarkers] = useState<{ label: string, uuid: string, lat: number; lon: number; children: any[]; }[] | null>(null) // Grouped by coordinates
    const [childrenLoading, setChildrenLoading] = useState(false)
    const [childrenFetching, setChildrenFetching] = useState(false)
    const [shownChildrenCount, setShownChildrenCount] = useState(0)
    const [childrenCount, setChildrenCount] = useState(0)
    const [childrenError, setChildrenError] = useState<Record<string, string> | null>(null)
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
    

    // Clear children bounds when parent changes
    useEffect(() => {
        setChildrenBounds(null)
        if (parent) {
            setChildrenLoading(true)
        }
    }, [parent])
    

    // Load children in search dataset
    useEffect(() => {
        if (!parent) return;
        if (parent != parentData?._source?.uuid) return;
        if (dataset != 'search' && !treeSettings[dataset]) return;
        if (dataset == 'search' && !parentData?._source?.children) return;


        setChildrenLoading(true)    
        setChildrenFetching(true)

        const requestBody: Record<string,any> = {mode}
        if (dataset == 'search') {
            requestBody.children = parentData?._source?.children
        }
        else {
            requestBody.within = parent
            requestBody.dataset = dataset
        }

        childrenData.current = null
        
        fetch("/api/children", {
            method: 'POST',
            body: JSON.stringify(requestBody)
        })
        .then(response => {
            if (!response.ok) {
                throw response
            }
            return response.json()})
        .then(es_data => {         
            childrenData.current = es_data.hits.hits
            if (requestBody.within) {
                setChildrenMarkers(groupSameCoordinates(childrenData.current))
            }  

            const newBounds = es_data.aggregations?.viewport.bounds
            if (!isTable && newBounds?.top_left && newBounds?.bottom_right) {
                const paddedBounds = addPadding([[newBounds.top_left.lat, newBounds.top_left.lon], [newBounds.bottom_right.lat, newBounds.bottom_right.lon]], isMobile)
                setChildrenBounds(paddedBounds)
            }


            
        }).catch(error => {
            console.error(error)
            setChildrenError({error: error.statusText, status: error.status})
        }).finally(() => {
            console.log("FINISHED FETCHING CHILDREN")
            setChildrenFetching(false)
        })
        
    }, [parentLoading, isTable, asc, desc, page, perPage, dataset, isMobile, mode, parent])




useEffect(() => {
    if (childrenFetching || !childrenData.current) return
    setChildrenLoading(true)
    setChildrenCount(childrenData.current?.length)

    if (sourceLabel) {
        filteredChildren.current = childrenData.current.filter((child: Record<string, any>) => {
            if ([child._source?.label, ...(child._source?.altLabels || []), ...(child._source?.attestations?.map((a: any) => a.label) || [])].some(label => label == sourceLabel)) return true;
            return false;
        }) || null
    }
    else if (sourceDataset) {
        filteredChildren.current = childrenData.current.filter((child: Record<string, any>) => child._index.split('-')[2] == sourceDataset)
    }
    else {
        filteredChildren.current = childrenData.current
    }

    setShownChildrenCount(filteredChildren.current?.length)

    if (!filteredChildren.current?.length) {
        console.log("NO FILTERED CHILDREN", JSON.stringify(childrenData.current))
        return
    }

    setChildrenMarkers(groupSameCoordinates(filteredChildren.current))

    if (dataset == 'search') {
        // Group by dataset
        const groupedChildren = filteredChildren.current?.reduce((acc: Record<string, Record<string, any>[]>, child: Record<string, any>) => {
            const index = child._index.split('-')[2]
            if (!acc[index]) acc[index] = []
            acc[index].push(child)
            return acc
        }, {})
        setSourceChildren(groupedChildren)
    }
    

    setChildrenLoading(false)
                
        
    }, [sourceLabel, sourceDataset, childrenFetching, dataset])
    

    /*

    const filterAndGroupChildren = useCallbacck((data: any[]) => {
        const matchingChildren = data.filter((doc: any) => {
            if (sourceLabel && !([doc._source?.label, ...(doc._source?.altLabels || []), ...(doc._source?.attestations?.map((a: any) => a.label) || [])].includes(sourceLabel))) return false;
            if (sourceDataset && !doc._index.includes(sourceDataset)) return false;
            return true;
        });

        setShownChildrenCount(matchingChildren.length);
        setChildrenCount(data.length)

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
    }, [sourceLabel, sourceDataset, childrenData]);

    useEffect(() => {
        if (childrenData?.length && dataset == 'search') {
            filterAndGroupChildren(childrenData);
        }
    }, [filterAndGroupChildren, dataset, childrenData]);
    */
    

    useEffect(() => {
        const children = filteredChildren.current?.length ? filteredChildren.current : childrenData.current
        if (parent && doc != parent && docData?._source?.location?.coordinates?.length == 2 && children?.length) {
            const currentCoordinates = docData._source.location.coordinates
            const sameCoordinates = children?.find((marker: any) => marker.lat == currentCoordinates[1] && marker.lon == currentCoordinates[0])
            //childrenData.current?.filter((child: Record<string, any>) => child.fields?.location?.[0]?.coordinates?.every((coord: number, index: number) => coord == currentCoordinates[index]))
            if (sameCoordinates && sameCoordinates?.children?.length > 1) {
                setSameMarkerList(sameCoordinates.children)
            }
            
        }
    }, [parent, docData, childrenLoading, doc])


    



    return <ChildrenContext.Provider value={{
        childrenData: childrenData.current,
        sourceChildren,
        childrenMarkers,
        childrenLoading,
        childrenError,
        childrenBounds,
        childrenCount,
        shownChildrenCount

  }}>{children}</ChildrenContext.Provider>
}




