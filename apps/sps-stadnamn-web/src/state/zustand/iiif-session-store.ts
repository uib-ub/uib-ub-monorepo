import { create } from 'zustand'



export const useIIIFSessionStore = create<{  

	drawerOpen: boolean,
	setDrawerOpen: (open: boolean) => void,
	
	snappedPosition: 'bottom' | 'middle' | 'top',
	setSnappedPosition: (position: 'bottom' | 'middle' | 'top') => void,

	currentPosition: number,
	setCurrentPosition: (position: number) => void,
	
	}>()((set) => ({

		snappedPosition: 'bottom',
		setSnappedPosition: (position: 'bottom' | 'middle' | 'top') => set({ snappedPosition: position }),

		drawerOpen: false,
		setDrawerOpen: (open: boolean) => set({ drawerOpen: open }),

		currentPosition: 0,
		setCurrentPosition: (position: number) => set({ currentPosition: position }),

}))	