import { create } from 'zustand'



export const useIIIFSessionStore = create<{  

	drawerOpen: boolean,
	setDrawerOpen: (open: boolean) => void,
	
	snappedPosition: 'min' | 'max',
	setSnappedPosition: (position: 'min' | 'max') => void,

	currentPosition: number,
	setCurrentPosition: (position: number) => void,
	
	}>()((set) => ({

		snappedPosition: 'min',
		setSnappedPosition: (position: 'min' | 'max') => set({ snappedPosition: position }),

		drawerOpen: false,
		setDrawerOpen: (open: boolean) => set({ drawerOpen: open }),

		currentPosition: 0,
		setCurrentPosition: (position: number) => set({ currentPosition: position }),

}))	