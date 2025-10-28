import { create } from 'zustand'



export const useContentPagesStore = create<{ 
    contentSearch: string,
    setContentSearch: (search: string) => void
	}>()((set) => ({
        contentSearch: '',
        setContentSearch: (search) => set({ contentSearch: search })
}))

