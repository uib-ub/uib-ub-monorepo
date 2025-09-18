import { create } from 'zustand'



export const useSessionStore = create<{ menuOpen: boolean, 
	setMenuOpen: (open: boolean) => void, toggleMenu: () => void,
	autocompleteOpen: boolean,
	setAutocompleteOpen: (open: boolean) => void,
	toggleAutocompleteOpen: () => void }>()((set) => ({
		menuOpen: false,
		setMenuOpen: (open) => set({ menuOpen: open }),
		toggleMenu: () => set((s) => ({ menuOpen: !s.menuOpen })),
		
		autocompleteOpen: false,
		setAutocompleteOpen: (open) => set({ autocompleteOpen: open }),
		toggleAutocompleteOpen: () => set((s) => ({ autocompleteOpen: !s.autocompleteOpen })),
}))