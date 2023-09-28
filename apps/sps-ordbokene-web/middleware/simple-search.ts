import { useSearchStore } from '~/stores/searchStore'
export default defineNuxtRouteMiddleware(async (to, from) => {
    const store = useSearchStore()

    let query = to.params.q || to.query.q
    store.dict = to.params.dict || 'bm,nn'

    if (query) {
      if (advancedSpecialSymbols(query)) {
        return navigateTo(`/${to.params.locale}/search?q=${query}&dict=${to.params.dict}&scope=${store.scope || 'ei'}`)
      }
      
      // Redirect if javascript is disabled
      if (to.query.q) {
        return `/${to.params.locale}/${to.params.dict}/${to.query.q}`
      }

    }
})