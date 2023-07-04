import { useStore } from '~/stores/searchStore'

export default defineNuxtRouteMiddleware(async (to, from) => {
    //console.log("MIDDLEWARE\nFROM: ", from, "\nTO: ", to, "\nREDIRECTED FROM:",to.redirectedFrom)
    const store = useStore()
    console.log("MIDDLEWARE")
    store.$patch({searchUrl: to.fullPath,
                  q: to.query.q,
                  pos: to.query.pos || store.pos,
                  scope:  to.query.scope || store.scope,
                  dict: to.query.dict || store.dict,
                  input: to.query.q || "",
                  view : 'advanced',
                  advanced: true})
                
})