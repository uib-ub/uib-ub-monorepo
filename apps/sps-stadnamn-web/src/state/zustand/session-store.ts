import { create } from 'zustand'



export const useSessionStore = create<{
	menuOpen: boolean,
	setMenuOpen: (open: boolean) => void, toggleMenu: () => void,
	autocompleteOpen: boolean,
	setAutocompleteOpen: (open: boolean) => void,
	toggleAutocompleteOpen: () => void,
	autocompleteActiveIndex: number,
	setAutocompleteActiveIndex: (index: number) => void,
	autocompleteHasResults: boolean,
	setAutocompleteHasResults: (hasResults: boolean) => void,

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

	displayRadius: number | null,
	setDisplayRadius: (radius: number | null) => void,
	displayPoint: [number, number] | null,
	setDisplayPoint: (point: [number, number] | null) => void,

	// When entering tree/cadastral view from /search, store the previous querystring
	// so we can restore it when leaving tree view.
	treeSavedQuery: string | null,
	setTreeSavedQuery: (query: string) => void,
	clearTreeSavedQuery: () => void,

	// Store the full URL before entering source view ("kjelder"),
	// so controls can reset back to the previous search state.
	sourceViewResetUrl: string | null,
	setSourceViewResetUrl: (url: string) => void,
	clearSourceViewResetUrl: () => void,

	// Persist the init group's label for use in the map anchor marker,
	// keyed by the point coordinate so we avoid showing a stale label
	// at the wrong position.
	initGroupLabel: string | null,
	initGroupPoint: [number, number] | null,
	setInitGroupLabel: (label: string | null, point: [number, number] | null) => void,

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

	displayRadius: null,
	setDisplayRadius: (radius: number | null) => set({ displayRadius: radius }),
	displayPoint: null,
	setDisplayPoint: (point: [number, number] | null) => set({ displayPoint: point }),

	treeSavedQuery: null,
	setTreeSavedQuery: (query: string) => set({ treeSavedQuery: query }),
	clearTreeSavedQuery: () => set({ treeSavedQuery: null }),

	sourceViewResetUrl: null,
	setSourceViewResetUrl: (url: string) => set({ sourceViewResetUrl: url }),
	clearSourceViewResetUrl: () => set({ sourceViewResetUrl: null }),

	initGroupLabel: null,
	initGroupPoint: null,
	setInitGroupLabel: (label: string | null, point: [number, number] | null) =>
		set({ initGroupLabel: label, initGroupPoint: point }),

	autocompleteActiveIndex: -1,
	setAutocompleteActiveIndex: (index: number) => set({ autocompleteActiveIndex: index }),
	autocompleteHasResults: false,
	setAutocompleteHasResults: (hasResults: boolean) => set({ autocompleteHasResults: hasResults }),

	autocompleteOpen: false,
	setAutocompleteOpen: (open) => set({ autocompleteOpen: open }),
	toggleAutocompleteOpen: () => set((s) => ({ autocompleteOpen: !s.autocompleteOpen })),
}))