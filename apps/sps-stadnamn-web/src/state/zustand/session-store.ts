import { create } from 'zustand'



export const useSessionStore = create<{ menuOpen: boolean, 
	setMenuOpen: (open: boolean) => void, toggleMenu: () => void,
	autocompleteOpen: boolean,
	setAutocompleteOpen: (open: boolean) => void,
	toggleAutocompleteOpen: () => void,

	myLocation: [number, number] | null,
	setMyLocation: (location: [number, number] | null) => void,

	drawerOpen: boolean,
	setDrawerOpen: (open: boolean) => void,

	drawerContent: string | null,
	setDrawerContent: (content: string | null) => void,

	snappedPosition: 'bottom' | 'middle' | 'top',
	setSnappedPosition: (position: 'bottom' | 'middle' | 'top') => void,
	
	currentPosition: number,
	setCurrentPosition: (position: number) => void,
	
	}>()((set) => ({
		menuOpen: false,
		setMenuOpen: (open) => set({ menuOpen: open }),
		toggleMenu: () => set((s) => ({ menuOpen: !s.menuOpen })),

		drawerContent: null,
		setDrawerContent: (content) => set({ drawerContent: content }),

		myLocation: null,
		setMyLocation: (location) => set({ myLocation: location }),

		drawerOpen: true,
		setDrawerOpen: (open) => set({ drawerOpen: open }),


		snappedPosition: 'bottom',
		setSnappedPosition: (position: 'bottom' | 'middle' | 'top') => set({ snappedPosition: position }),

		currentPosition: 0,
		setCurrentPosition: (position: number) => set({ currentPosition: position }),
		
		autocompleteOpen: false,
		setAutocompleteOpen: (open) => set({ autocompleteOpen: open }),
		toggleAutocompleteOpen: () => set((s) => ({ autocompleteOpen: !s.autocompleteOpen })),
}))