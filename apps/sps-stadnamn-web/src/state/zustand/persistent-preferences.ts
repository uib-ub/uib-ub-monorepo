import { create } from 'zustand'
import { persist } from 'zustand/middleware'



type Preferences = {
  facetSort: Record<string, string>
  setFacetSort: (facet: string, sort: string) => void
  facetCountMode: 'absolute' | 'percent'
  setFacetCountMode: (mode: 'absolute' | 'percent') => void
}

export const usePreferences = create<Preferences>()(
  persist(
    (set, get) => ({
      facetSort: {},
      setFacetSort: (facet, sort) =>
        set((state) => ({
          facetSort: {
            ...state.facetSort,
            [facet]: sort
          }
        })),
      facetCountMode: 'absolute',
      setFacetCountMode: (mode) =>
        set(() => ({
          facetCountMode: mode
        }))
    }),
    {
      name: 'preferences'
    }
  )
)
