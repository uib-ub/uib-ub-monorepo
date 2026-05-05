import { create } from 'zustand'



export const useIIIFSessionStore = create<{

	drawerOpen: boolean,
	setDrawerOpen: (open: boolean) => void,
	
	navOpen: boolean,
	setNavOpen: (open: boolean) => void,
	
	snappedPosition: 'bottom' | 'middle' | 'top',
	setSnappedPosition: (position: 'bottom' | 'middle' | 'top') => void,
	
	currentPosition: number,
	setCurrentPosition: (position: number) => void,

	// Single archive search context used for "back to search" buttons
	searchContext: { collectionUuid: string | null, query: string } | null,
	setSearchContext: (ctx: { collectionUuid: string | null, query: string } | null) => void,

	// Item to focus when returning from manifest back to search
	returnFocusUuid: string | null,
	setReturnFocusUuid: (uuid: string | null) => void,

}>()((set) => ({

	navOpen: (() => {
		try {
			if (typeof window !== 'undefined') {
				return sessionStorage.getItem('iiifNeighbourNavOpen') === '1'
			}
		} catch { }
		return false
	})(),
	setNavOpen: (open: boolean) => {
		try { if (typeof window !== 'undefined') sessionStorage.setItem('iiifNeighbourNavOpen', open ? '1' : '0') } catch { }
		set({ navOpen: open })
	},

	snappedPosition: 'bottom',
	setSnappedPosition: (position: 'bottom' | 'middle' | 'top') => set({ snappedPosition: position }),

	drawerOpen: false,
	setDrawerOpen: (open: boolean) => set({ drawerOpen: open }),

	currentPosition: 0,
	setCurrentPosition: (position: number) => set({ currentPosition: position }),

	searchContext: null,
	setSearchContext: (ctx: { collectionUuid: string | null, query: string } | null) => set({ searchContext: ctx }),

	returnFocusUuid: null,
	setReturnFocusUuid: (uuid: string | null) => set({ returnFocusUuid: uuid }),

}))	