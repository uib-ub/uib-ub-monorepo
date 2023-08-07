import { useStore } from '~/stores/searchStore'


export default defineNuxtRouteMiddleware(async (to, from) => {
    console.log("DICT MIDDLEWARE\nFROM: ", from, "\nTO: ", to, "\nREDIRECTED FROM:",to.redirectedFrom)
    const store = useStore()
    if (to.params.slug) {
        // Articles
        if (/^[0-9]+$/.test(to.params.slug[0])) {
            store.view = 'article'
        }
        // Words
        else {
            //console.log("WORD")
            store.view = 'word'
            store.searchUrl = to.fullPath
            store.q = to.params.slug[0]
            store.input = to.query.orig || to.params.slug[0]           
        }
    }
    else if (to.name == 'dict-suggest') {
        //console.log("SUGGEST")
        store.q = to.query.q
        store.input = to.query.q || ""
        store.view = 'suggest'
        
        
    }
    else {
        store.q = ""
        store.input = ""
    }

})