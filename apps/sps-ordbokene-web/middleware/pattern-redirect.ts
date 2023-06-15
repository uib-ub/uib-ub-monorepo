import { useStore } from '~/stores/searchStore'
export default defineNuxtRouteMiddleware(async (to, from) => {
    const store = useStore()
    store.dict = to.params.dict
    let query = to.params.q || to.query.q
    if (specialSymbols(query)) {
      return navigateTo(`/search?q=${query}&dict=${to.params.dict}&scope=${store.scope || 'ei'}`)
    }
})