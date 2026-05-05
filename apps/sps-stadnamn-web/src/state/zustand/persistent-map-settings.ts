import { baseLayerKeys, baseLayerMaps, defaultBaseMap, overlayLayerKeys } from '@/config/basemap-config'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const MAP_SETTINGS_STORAGE_KEY = 'map-settings-v2'
const LEGACY_MAP_SETTINGS_STORAGE_KEY = 'map-settings'
const LEGACY_BASE_MAP_KEY_MAP: Record<string, string> = {
  world_map_voyager_nolabels: 'standard',
  world_map: 'neutral',
  stamen_toner_background: 'high_contrast',
  stamen_terrain_background: 'terrain',
  esri_firefly_satellite: 'satellite',
}

const normalizeBaseMapKey = (mapKey: string | null | undefined): string | null => {
  if (!mapKey || typeof mapKey !== 'string') return null
  const normalized = LEGACY_BASE_MAP_KEY_MAP[mapKey] || mapKey
  return baseLayerKeys.includes(normalized) ? normalized : null
}

type MapSettings = {
  baseMap: string
  overlayMaps: string[]
  markerMode: string
  setBaseMap: (baseMap: string) => void
  addOverlayMap: (mapKey: string) => void
  removeOverlayMap: (mapKey: string) => void
  moveOverlayMap: (fromIndex: number, toIndex: number) => void
  toggleOverlayMap: (mapKey: string) => void
  clearOverlayMaps: () => void
  setMarkerMode: (mode: string) => void
  initializeSettings: () => void
}

export const useMapSettings = create<MapSettings>()(
  persist(
    (set, get) => ({
      baseMap: defaultBaseMap,
      overlayMaps: [],
      markerMode: 'auto',
      setBaseMap: (baseMap: string) =>
        set(() => ({
          baseMap
        })),
      addOverlayMap: (mapKey: string) =>
        set((state) => {
          const current = state.overlayMaps || []
          if (current.includes(mapKey)) return { overlayMaps: current }
          return { overlayMaps: [...current, mapKey] }
        }),
      removeOverlayMap: (mapKey: string) =>
        set((state) => ({
          overlayMaps: (state.overlayMaps || []).filter((key) => key !== mapKey)
        })),
      moveOverlayMap: (fromIndex: number, toIndex: number) =>
        set((state) => {
          const current = [...(state.overlayMaps || [])]
          if (
            fromIndex < 0 ||
            toIndex < 0 ||
            fromIndex >= current.length ||
            toIndex >= current.length ||
            fromIndex === toIndex
          ) {
            return { overlayMaps: current }
          }
          const [moved] = current.splice(fromIndex, 1)
          current.splice(toIndex, 0, moved)
          return { overlayMaps: current }
        }),
      toggleOverlayMap: (mapKey: string) =>
        set((state) => {
          const current = state.overlayMaps || []
          const next = current.includes(mapKey)
            ? current.filter((key) => key !== mapKey)
            : [...current, mapKey]
          return {
            overlayMaps: next
          }
        }),
      clearOverlayMaps: () =>
        set(() => ({
          overlayMaps: []
        })),
      setMarkerMode: (mode: string) => set({ markerMode: mode }),
      initializeSettings: () => {
        const state = get()
        const normalizedBaseMap = normalizeBaseMapKey(state.baseMap)
        if (!normalizedBaseMap) {
          set(() => ({
            baseMap: defaultBaseMap || baseLayerMaps[0].key
          }))
        } else if (normalizedBaseMap !== state.baseMap) {
          set(() => ({
            baseMap: normalizedBaseMap
          }))
        }
        const currentOverlays = state.overlayMaps || []
        const validOverlays = currentOverlays.filter((key) => overlayLayerKeys.includes(key))
        if (currentOverlays.length !== validOverlays.length) {
          set(() => ({
            overlayMaps: validOverlays
          }))
        }
      }
    }),
    {
      name: MAP_SETTINGS_STORAGE_KEY,
      version: 6,
      onRehydrateStorage: () => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(LEGACY_MAP_SETTINGS_STORAGE_KEY)
        }
      },
      migrate: (persistedState: any) => {
        if (!persistedState) {
          return persistedState
        }
        const nextState = { ...persistedState }
        const persistedBaseMap = persistedState.baseMap
        const persistedOverlays = persistedState.overlayMaps
        const legacyBaseMapByPerspective =
          persistedBaseMap && typeof persistedBaseMap === 'object' && !Array.isArray(persistedBaseMap)
            ? persistedBaseMap
            : null
        const legacyOverlaysByPerspective =
          persistedOverlays && typeof persistedOverlays === 'object' && !Array.isArray(persistedOverlays)
            ? persistedOverlays
            : null

        const migratedBaseMap = (() => {
          if (typeof persistedBaseMap === 'string') {
            const normalized = normalizeBaseMapKey(persistedBaseMap)
            if (normalized) return normalized
          }
          if (legacyBaseMapByPerspective) {
            const candidates = [legacyBaseMapByPerspective.all, ...Object.values(legacyBaseMapByPerspective)]
            const firstValid = candidates
              .map((key) => (typeof key === 'string' ? normalizeBaseMapKey(key) : null))
              .find((key) => typeof key === 'string')
            if (typeof firstValid === 'string') return firstValid
          }
          return defaultBaseMap || baseLayerMaps[0].key
        })()

        const migratedOverlays = (() => {
          if (Array.isArray(persistedOverlays)) {
            return Array.from(new Set(persistedOverlays.filter((key: any) => overlayLayerKeys.includes(key))))
          }
          if (legacyOverlaysByPerspective) {
            const allLegacy = Object.values(legacyOverlaysByPerspective)
              .flatMap((val: any) => (Array.isArray(val) ? val : []))
              .filter((key: any) => overlayLayerKeys.includes(key))
            return Array.from(new Set(allLegacy))
          }
          return []
        })()

        // "circles" mode has been removed; normalize old persisted values.
        if (persistedState.markerMode === 'circles') {
          return {
            ...nextState,
            baseMap: migratedBaseMap as string,
            overlayMaps: migratedOverlays as string[],
            markerMode: 'points'
          }
        }
        return {
          ...nextState,
          baseMap: migratedBaseMap as string,
          overlayMaps: migratedOverlays as string[]
        }
      }
    }
  )
)
