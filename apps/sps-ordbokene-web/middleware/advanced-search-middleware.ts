import { useStore } from '~/stores/searchStore'

export default defineNuxtRouteMiddleware(async (to, from) => {
    //console.log("MIDDLEWARE\nFROM: ", from, "\nTO: ", to, "\nREDIRECTED FROM:",to.redirectedFrom)
    const store = useStore()
    store.advanced = true
    store.searchUrl = to.fullPath
    store.q = to.query.q
    store.pos = to.query.pos || store.pos
    store.scope = to.query.scope || store.scope
    store.dict = to.query.dict || store.dict
    store.input = to.query.q || ""
    store.view = 'advanced'
        


})