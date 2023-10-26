import { useSearchStore } from '~/stores/searchStore'
export default defineNuxtRouteMiddleware(async (to, from) => {
    const store = useSearchStore()
    // Redirect if javascript is disabled
    if (to.query.q) {
      return navigateTo(`/${to.params.locale}/${to.params.dict}/${to.query.q}`)
    }

    store.dict = to.params.dict || 'bm,nn'
    store.q = (to.params.q && decodeURI(to.params.q)) || (to.query.q && decodeURI(to.query.q)) || store.q
    if (store.q && to.name != 'article') {
      store.searchUrl = to.fullPath
      store.lemmas.bm = new Set()
      store.lemmas.nn = new Set()

      // Redirect to advanced search if special symbols
      if (advancedSpecialSymbols(store.q)) {
        return navigateTo(`/${to.params.locale}/search?q=${store.q}&dict=${to.params.dict}&scope=${store.scope || 'ei'}`)
      }

      store.input = (to.query.orig && decodeURI(to.query.orig)) || store.q
      

    }
})