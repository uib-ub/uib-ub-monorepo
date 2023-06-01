import { useStore } from '~/stores/searchStore'


export default defineNuxtRouteMiddleware(async (to, from) => {
    //console.log("MIDDLEWARE\nFROM: ", from, "\nTO: ", to, "\nREDIRECTED FROM:",to.redirectedFrom)
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
        // Redirect to advanced
        if (specialSymbols(to.query.q)) {
            //console.log("REDIRECT TO ADVANCED")
            store.scope = "e"
            return navigateTo(`/${store.dict}/search?q=${to.query.q}&scope=${store.scope}`)
        }
        else {
            //console.log("SIMPLE SEARCH")
            store.advanced = false
            const { pending, error, refresh, data: suggestions } = await useAsyncData(`suggest_${to.query.q}_${to.params.dict}`, () => $fetch(`${store.endpoint}api/suggest?&q=${to.query.q}&dict=${to.params.dict}&n=20&dform=int&meta=n&include=ei`))
            let { exact, inflect } = suggestions.value.a
    
            if (exact) {
                if (exact[0][0].length == store.q.length) {
                    // kun hvis resultatet er et uttrykk eller har litt andre tegn?
                    //console.log("EXACT", exact[0][0])
                    let redirectUrl = `/${store.dict}/${exact[0][0]}`
                    if (exact[0][0] != to.query.q) redirectUrl += `?orig=${to.query.q}`

                    return navigateTo(redirectUrl)
                }
            }
            if (inflect) {
                    //console.log("INFLECT", inflect[0][0])

                    return navigateTo(`/${store.dict}/${inflect[0][0]}?orig=${to.query.q}`)
                
            }

            //console.log("REDIRECT SUGGEST")
            return navigateTo(`/${store.dict}/suggest?q=${to.query.q}`)

        }
    }


})