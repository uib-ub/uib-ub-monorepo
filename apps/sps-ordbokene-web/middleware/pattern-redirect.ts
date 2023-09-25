import { useSearchStore } from '~/stores/searchStore'
export default defineNuxtRouteMiddleware(async (to, from) => {
    const store = useSearchStore()
    store.dict = to.params.dict || 'bm,nn'
    let query = to.params.q || to.query.q
    if (advancedSpecialSymbols(query)) {
      return navigateTo(`/search?q=${query}&dict=${to.params.dict}&scope=${store.scope || 'ei'}`)
    }
})