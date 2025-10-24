import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { useContext } from "react"
import { GlobalContext } from "../providers/global-provider"
import { useDebugStore } from "../zustand/debug-store"


const groupDebugDataQuery = async (q: string | null, bounds: { topLeftLat: number | null, topLeftLng: number | null, bottomRightLat: number | null, bottomRightLng: number | null }, children?: any[]) => {
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
    const debug = useDebugStore((s) => s.debug)

    const children = selectedGroup?._source?.children || []

    
    // Get current map bounds from map instance
    const getMapBounds = () => {
        if (!mapFunctionRef?.current) return null
        
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
        queryKey: ['group-debug', q, selectedGroup?._id, bounds?.topLeftLat, bounds?.topLeftLng, bounds?.bottomRightLat, bounds?.bottomRightLng],
        queryFn: () => groupDebugDataQuery(q, bounds || { topLeftLat: null, topLeftLng: null, bottomRightLat: null, bottomRightLng: null }, children),
        enabled: !!mapFunctionRef?.current && debug // Only run query when map is available and debug groups is enabled
    })
}


export function useGniduData(selectedGroup?: any) {
    const gnidus = selectedGroup?._source?.gnidu

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
