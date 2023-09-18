import { useStore } from '~/stores/searchStore'

export default defineNuxtRouteMiddleware(async (to, from) => {
    const store = useStore()
    store.$patch({searchUrl: to.fullPath,
                  q: to.query.q,
                  pos: to.query.pos || store.pos,
                  scope:  to.query.scope || store.scope,
                  dict: to.query.dict || store.dict,
                  input: to.query.q || ""})
                
})