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
    toggleH3Grid: () => void,
    h3Resolution: number,
    setH3Resolution: (resolution: number) => void,

    debugChildren: any[],
    setDebugChildren: (children: any[]) => void,
    debugGroups: boolean,
    setDebugGroups: (groups: boolean) => void,

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
            setShowH3Grid: (show) => set({ showH3Grid: show }),
            toggleH3Grid: () => set((state) => ({ showH3Grid: !state.showH3Grid })),
            h3Resolution: 5,
            setH3Resolution: (resolution) => set({ h3Resolution: resolution }),

            debugChildren: [],
            setDebugChildren: (children) => set({ debugChildren: children }),
            debugGroups: false,
            setDebugGroups: (groups) => set({ debugGroups: groups }),
        }),
        {
            name: 'debug'
        }
    )
)