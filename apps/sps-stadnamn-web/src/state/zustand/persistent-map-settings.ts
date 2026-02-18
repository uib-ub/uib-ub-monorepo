import { baseLayerKeys, baseLayerMaps, defaultBaseMap, overlayLayerKeys } from '@/config/basemap-config'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type MapSettings = {
  baseMap: Record<string, string>
  overlayMaps: Record<string, string[]>
  markerMode: string
  setBaseMap: (perspective: string, baseMap: string) => void
  toggleOverlayMap: (perspective: string, mapKey: string) => void
  clearOverlayMaps: (perspective: string) => void
  setMarkerMode: (mode: string) => void
  initializeSettings: (perspective: string) => void
}

export const useMapSettings = create<MapSettings>()(
  persist(
    (set, get) => ({
      baseMap: {},
      overlayMaps: {},
      markerMode: 'auto',
      setBaseMap: (perspective: string, baseMap: string) =>
        set((state) => ({
          baseMap: {
            ...state.baseMap,
            [perspective]: baseMap
          }
        })),
      toggleOverlayMap: (perspective: string, mapKey: string) =>
        set((state) => {
          const current = state.overlayMaps[perspective] || []
          const next = current.includes(mapKey)
            ? current.filter((key) => key !== mapKey)
            : [...current, mapKey]
          return {
            overlayMaps: {
              ...state.overlayMaps,
              [perspective]: next
            }
          }
        }),
      clearOverlayMaps: (perspective: string) =>
        set((state) => ({
          overlayMaps: {
            ...state.overlayMaps,
            [perspective]: []
          }
        })),
      setMarkerMode: (mode: string) => set({ markerMode: mode }),
      initializeSettings: (perspective: string) => {
        const state = get()
        if (!state.baseMap[perspective] || !baseLayerKeys.includes(state.baseMap[perspective])) {
          set((state) => ({
            baseMap: {
              ...state.baseMap,
              [perspective]: defaultBaseMap[perspective] || baseLayerMaps[0].key
            }
          }))
        }
        const currentOverlays = state.overlayMaps[perspective] || []
        const validOverlays = currentOverlays.filter((key) => overlayLayerKeys.includes(key))
        if (currentOverlays.length !== validOverlays.length) {
          set((state) => ({
            overlayMaps: {
              ...state.overlayMaps,
              [perspective]: validOverlays
            }
          }))
        }
      }
    }),
    {
      name: 'map-settings',
      version: 4,
      migrate: (persistedState: any) => {
        if (!persistedState) {
          return persistedState
        }
        const nextState = {
          ...persistedState,
          overlayMaps: persistedState.overlayMaps || {}
        }
        const persistedBaseMap = persistedState.baseMap || {}
        const migratedBaseMap: Record<string, string> = { ...persistedBaseMap }
        const migratedOverlays: Record<string, string[]> = { ...nextState.overlayMaps }

        Object.entries(persistedBaseMap).forEach(([perspective, mapKey]) => {
          if (!baseLayerKeys.includes(mapKey as string) && overlayLayerKeys.includes(mapKey as string)) {
            migratedBaseMap[perspective] = defaultBaseMap[perspective] || baseLayerMaps[0].key
            migratedOverlays[perspective] = Array.from(new Set([...(migratedOverlays[perspective] || []), mapKey as string]))
          }
        })

        // "circles" mode has been removed; normalize old persisted values.
        if (persistedState.markerMode === 'circles') {
          return {
            ...nextState,
            baseMap: migratedBaseMap,
            overlayMaps: migratedOverlays,
            markerMode: 'points'
          }
        }
        return {
          ...nextState,
          baseMap: migratedBaseMap,
          overlayMaps: migratedOverlays
        }
      }
    }
  )
)
