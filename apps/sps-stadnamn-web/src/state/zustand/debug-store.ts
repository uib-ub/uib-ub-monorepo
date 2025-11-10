import { create } from 'zustand'
import { persist } from 'zustand/middleware'


export const useDebugStore = create<{
    debug: boolean,
    setDebug: (debug: boolean) => void,

    showGeotileGrid: boolean,
    setShowGeotileGrid: (show: boolean) => void,
    toggleGeotileGrid: () => void,

    showScore: boolean,
    setShowScore: (show: boolean) => void,

    showMarkerBounds: boolean,
    setShowMarkerBounds: (show: boolean) => void,
    toggleMarkerBounds: () => void,

    showH3Grid: boolean,
    setShowH3Grid: (show: boolean) => void,
    h3Resolution: number,
    setH3Resolution: (resolution: number) => void,

    debugChildren: any[],
    setDebugChildren: (children: any[]) => void,
    
    showDebugGroups: boolean,
    setShowDebugGroups: (show: boolean) => void,
    debugGroupsSortBy: 'uuid' | 'uuid_count' | 'h3_count',
    setDebugGroupsSortBy: (sortBy: 'uuid' | 'uuid_count' | 'h3_count') => void,
    highlightTopGroups: boolean,
    setHighlightTopGroups: (highlight: boolean) => void,

}>()(
    persist(
        (set) => ({
            debug: false,
            setDebug: (debug) => set({ debug }),

            showScore: false,
            setShowScore: (show) => set({ showScore: show }),

            showGeotileGrid: false,
            setShowGeotileGrid: (show) => set({ showGeotileGrid: show }),
            toggleGeotileGrid: () => set((state) => ({ showGeotileGrid: !state.showGeotileGrid })),

            showMarkerBounds: false,
            setShowMarkerBounds: (show) => set({ showMarkerBounds: show }),
            toggleMarkerBounds: () => set((state) => ({ showMarkerBounds: !state.showMarkerBounds })),

            showH3Grid: false,
            setShowH3Grid: (show: boolean) => set({ showH3Grid: show }),
            h3Resolution: 5,
            setH3Resolution: (resolution) => set({ h3Resolution: resolution }),

            debugChildren: [],
            setDebugChildren: (children) => set({ debugChildren: children }),
            showDebugGroups: false,
            setShowDebugGroups: (show) => set({ showDebugGroups: show }),
            debugGroupsSortBy: 'uuid' as 'uuid' | 'uuid_count' | 'h3_count',
            setDebugGroupsSortBy: (sortBy) => set({ debugGroupsSortBy: sortBy }),
            highlightTopGroups: false,
            setHighlightTopGroups: (highlight) => set({ highlightTopGroups: highlight }),
        }),
        {
            name: 'debug'
        }
    )
)