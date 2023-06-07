import { useStore } from '~/stores/searchStore'
export default defineNuxtRouteMiddleware(async (to, from) => {
    console.log("SEARCH MIDDLEWARE\nFROM: ", from, "\nTO: ", to, "\nREDIRECTED FROM:",to.redirectedFrom)
    const store = useStore()
        // Redirect old links to advanced search
    if (to.query.scope) {
        let url = `/search?q=${to.query.q}&dict=${to.params.dict}&scope=${to.query.scope}`
        if (to.query.pos) {
            url += "&pos=" + to.query.pos
        }
        return navigateTo(url)
    }
    else { // Simple search
        if (specialSymbols(to.query.q)) {
            store.scope = "e"
            return navigateTo(`/${store.dict}/search?q=${to.query.q}&scope=${store.scope}`)
        }
        else {
            //console.log("SIMPLE SEARCH")
            store.advanced = false
            const { pending, error, refresh, data: suggestions } = await useFetch(() =>  `${store.endpoint}api/suggest?&q=${to.query.q}&dict=${to.params.dict}&n=20&dform=int&meta=n&include=ei`)
            let { exact, inflect } = suggestions.value.a
    
            if (exact) {
                if (exact[0][0].length == store.q.length) {
                    let redirectUrl = `/${store.dict}/${exact[0][0]}`
                    if (exact[0][0] != to.query.q) redirectUrl += `?orig=${to.query.q}`

                    return navigateTo(redirectUrl)
                }
            }
            if (inflect) {
                return navigateTo(`/${store.dict}/${inflect[0][0]}?orig=${to.query.q}`)
                
            }
            return navigateTo(`/${store.dict}/suggest?q=${to.query.q}`)

        }
    }


})