import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { useContext } from "react"
import { GlobalContext } from "../providers/global-provider"
import { useDebugStore } from "../zustand/debug-store"


const groupDebugDataQuery = async (q: string | null, bounds: { topLeftLat: number | null, topLeftLng: number | null, bottomRightLat: number | null, bottomRightLng: number | null }, children?: any[], sort?: string, size?: number) => {
    const params = new URLSearchParams()

    if (children?.length) {
        const res = await fetch('/api/debug/groups', {
            method: 'POST',
            body: JSON.stringify({ children }),
        })
            if (!res.ok) {
                throw new Error('Failed to fetch group debug data')
            }
            const data = await res.json()
            return data
    }
    
    if (q) {
        params.set('q', q)
    }
    
    if (sort) {
        params.set('sort', sort)
    }
    
    if (size) {
        params.set('size', size.toString())
    }
    
    if (bounds.topLeftLat !== null && bounds.topLeftLng !== null && bounds.bottomRightLat !== null && bounds.bottomRightLng !== null) {
        params.set('topLeftLat', bounds.topLeftLat.toString())
        params.set('topLeftLng', bounds.topLeftLng.toString())
        params.set('bottomRightLat', bounds.bottomRightLat.toString())
        params.set('bottomRightLng', bounds.bottomRightLng.toString())
    }
    
    const url = params.toString() ? `/api/debug/groups?${params.toString()}` : '/api/debug/groups'
    const res = await fetch(url)
    if (!res.ok) {
        throw new Error('Failed to fetch group debug data')
    }
    return res.json()
}

export function useGroupDebugData(selectedGroup?: any) {
    const searchParams = useSearchParams()
    const { mapFunctionRef } = useContext(GlobalContext)
    const q = searchParams.get('q')
    const showDebugGroups = searchParams.get('debugGroups') == 'on'

    const children = selectedGroup?._source?.misc?.children || []
    const hasChildren = children.length > 0
    const isFetchingChildren = !!selectedGroup && hasChildren

    
    // Get current map bounds from map instance (only when not fetching children)
    const getMapBounds = () => {
        if (!mapFunctionRef?.current || isFetchingChildren) return null
        
        try {
            const mapBounds = mapFunctionRef.current.getBounds()
            if (!mapBounds) return null
            
            // Convert to the format expected by the API: [[north, west], [south, east]]
            const north = mapBounds.getNorth()
            const west = mapBounds.getWest()
            const south = mapBounds.getSouth()
            const east = mapBounds.getEast()
            
            return {
                topLeftLat: north,
                topLeftLng: west,
                bottomRightLat: south,
                bottomRightLng: east
            }
        } catch (error) {
            console.warn('Failed to get map bounds:', error)
            return null
        }
    }
    
    const bounds = getMapBounds()

    
    return useQuery({
        // When fetching children, don't include bounds in query key to prevent refetching on pan
        queryKey: isFetchingChildren 
            ? ['group-debug-children', selectedGroup?._id, children.length]
            : ['group-debug', q, selectedGroup?._id, hasChildren, children.length, bounds?.topLeftLat, bounds?.topLeftLng, bounds?.bottomRightLat, bounds?.bottomRightLng],
        queryFn: () => {
            // If a group is selected but has no children, return empty result immediately
            if (selectedGroup && !hasChildren) {
                return Promise.resolve({ hits: { hits: [] } })
            }
            // When fetching children, don't use bounds - just fetch by children IDs
            // Always sort by uuid (no sort param) for even distribution of markers
            return groupDebugDataQuery(q, isFetchingChildren ? { topLeftLat: null, topLeftLng: null, bottomRightLat: null, bottomRightLng: null } : bounds || { topLeftLat: null, topLeftLng: null, bottomRightLat: null, bottomRightLng: null }, children, undefined, 100)
        },
        enabled: !!mapFunctionRef?.current && showDebugGroups // Only run query when map is available and debug groups is enabled
    })
}

export function useSortedGroups() {
    const searchParams = useSearchParams()
    const { mapFunctionRef } = useContext(GlobalContext)
    const q = searchParams.get('q')
    const showDebugGroups = searchParams.get('debugGroups') == 'on'
    const debugGroupsSortBy = useDebugStore((s) => s.debugGroupsSortBy)

    // Get current map bounds from map instance
    const getMapBounds = () => {
        if (!mapFunctionRef?.current) return null
        
        try {
            const mapBounds = mapFunctionRef.current.getBounds()
            if (!mapBounds) return null
            
            const north = mapBounds.getNorth()
            const west = mapBounds.getWest()
            const south = mapBounds.getSouth()
            const east = mapBounds.getEast()
            
            return {
                topLeftLat: north,
                topLeftLng: west,
                bottomRightLat: south,
                bottomRightLng: east
            }
        } catch (error) {
            console.warn('Failed to get map bounds:', error)
            return null
        }
    }
    
    const bounds = getMapBounds()

    // Map sortBy to API sort parameter
    // uuid -> undefined (sorts by uuid asc for random distribution)
    // uuid_count -> 'uuid' (sorts by child_count desc)
    // h3_count -> 'h3' (sorts by h3_count desc)
    const apiSortParam = debugGroupsSortBy === 'uuid_count' ? 'uuid' : debugGroupsSortBy === 'h3_count' ? 'h3' : undefined

    return useQuery({
        queryKey: ['sorted-groups', q, debugGroupsSortBy, bounds?.topLeftLat, bounds?.topLeftLng, bounds?.bottomRightLat, bounds?.bottomRightLng],
        queryFn: () => groupDebugDataQuery(q, bounds || { topLeftLat: null, topLeftLng: null, bottomRightLat: null, bottomRightLng: null }, undefined, apiSortParam, 100),
        enabled: !!mapFunctionRef?.current && showDebugGroups
    })
}

export function useTopGroups() {
    const searchParams = useSearchParams()
    const { mapFunctionRef } = useContext(GlobalContext)
    const q = searchParams.get('q')
    const showDebugGroups = searchParams.get('debugGroups') == 'on'
    const debugGroupsSortBy = useDebugStore((s) => s.debugGroupsSortBy)
    const highlightTopGroups = useDebugStore((s) => s.highlightTopGroups)

    // Get current map bounds from map instance
    const getMapBounds = () => {
        if (!mapFunctionRef?.current) return null
        
        try {
            const mapBounds = mapFunctionRef.current.getBounds()
            if (!mapBounds) return null
            
            const north = mapBounds.getNorth()
            const west = mapBounds.getWest()
            const south = mapBounds.getSouth()
            const east = mapBounds.getEast()
            
            return {
                topLeftLat: north,
                topLeftLng: west,
                bottomRightLat: south,
                bottomRightLng: east
            }
        } catch (error) {
            console.warn('Failed to get map bounds:', error)
            return null
        }
    }
    
    const bounds = getMapBounds()

    // Only fetch top groups if highlighting is enabled and sort is not 'uuid' (which is for random distribution)
    const shouldFetch = highlightTopGroups && debugGroupsSortBy !== 'uuid'
    
    // Map sortBy to API sort parameter
    // uuid_count -> 'uuid' (sorts by child_count desc)
    // h3_count -> 'h3' (sorts by h3_count desc)
    const apiSortParam = debugGroupsSortBy === 'uuid_count' ? 'uuid' : debugGroupsSortBy === 'h3_count' ? 'h3' : undefined

    return useQuery({
        queryKey: ['top-groups', q, debugGroupsSortBy, bounds?.topLeftLat, bounds?.topLeftLng, bounds?.bottomRightLat, bounds?.bottomRightLng],
        queryFn: () => groupDebugDataQuery(q, bounds || { topLeftLat: null, topLeftLng: null, bottomRightLat: null, bottomRightLng: null }, undefined, apiSortParam, 5),
        enabled: !!mapFunctionRef?.current && showDebugGroups && shouldFetch
    })
}


export function useGniduData(selectedGroup?: any) {
    const gnidus = selectedGroup?._source?.gnidu || selectedGroup?._source?.misc?.gnidu

    return useQuery({
        queryKey: ['gnidu', selectedGroup?._id],
        queryFn: async () => {
            const res = await fetch(`/api/debug/gnidus`, {
                method: 'POST',
                body: JSON.stringify({ gnidus }),
            })
            if (!res.ok) {
                throw new Error('Failed to fetch gnidu data')
            }
            return res.json()
        },
        enabled: gnidus?.length > 0
    })
}
