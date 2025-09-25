import { create } from 'zustand'



export const useIIIFSessionStore = create<{  

	drawerOpen: boolean,
	setDrawerOpen: (open: boolean) => void,
	
	snappedPosition: 'min' | 'max',
	setSnappedPosition: (position: 'min' | 'max') => void,
	
	}>()((set) => ({

		snappedPosition: 'min',
		setSnappedPosition: (position: 'min' | 'max') => set({ snappedPosition: position }),

		drawerOpen: false,
		setDrawerOpen: (open: boolean) => set({ drawerOpen: open }),

}))	