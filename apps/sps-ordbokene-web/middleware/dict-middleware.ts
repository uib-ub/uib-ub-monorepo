import { useStore } from '~/stores/searchStore'


export default defineNuxtRouteMiddleware(async (to, from) => {
    //console.log("MIDDLEWARE\nFROM: ", from, "\nTO: ", to, "\nREDIRECTED FROM:",to.redirectedFrom)
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
            store.advanced = false
            store.searchUrl = to.fullPath
            store.q = to.params.slug[0]
            if (to.redirectedFrom && to.redirectedFrom.query.q != store.q) {
                //console.log("SETTING ORIGINAL INPUT")
                store.originalInput = to.redirectedFrom.query.q
            } else  {
                store.originalInput = ""
                store.input = store.q
            }
            

        }
    }
    else if (to.name == 'dict-suggest') {
        //console.log("SUGGEST")
        store.q = to.query.q
        store.input = to.query.q || ""
        store.originalInput = ""
        store.view = 'suggest'
        
        
    }
    else {
        store.q = ""
        store.input = ""
        store.advanced = false
    }

})