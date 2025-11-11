import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { baseMaps, baseMapKeys, defaultBaseMap } from '@/config/basemap-config'

type MapSettings = {
  baseMap: Record<string, string>
  markerMode: string
  setBaseMap: (perspective: string, baseMap: string) => void
  setMarkerMode: (mode: string) => void
  initializeSettings: (perspective: string) => void
}

export const useMapSettings = create<MapSettings>()(
  persist(
    (set, get) => ({
      baseMap: {},
      markerMode: 'auto',
      setBaseMap: (perspective: string, baseMap: string) => 
        set((state) => ({ 
          baseMap: { 
            ...state.baseMap, 
            [perspective]: baseMap 
          } 
        })),
      setMarkerMode: (mode: string) => set({ markerMode: mode }),
      initializeSettings: (perspective: string) => {
        const state = get()
        if (!state.baseMap[perspective] || !baseMapKeys.includes(state.baseMap[perspective])) {
          set((state) => ({
            baseMap: {
              ...state.baseMap,
              [perspective]: defaultBaseMap[perspective] || baseMaps[0].key
            }
          }))
        }
      }
    }),
    {
      name: 'map-settings'
    }
  )
)
