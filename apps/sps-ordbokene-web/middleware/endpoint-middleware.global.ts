import { useStore } from '~/stores/searchStore'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const store = useStore()

    //console.log("MIDDLEWARE\nFROM: ", from, "\nTO: ", to, "\nREDIRECTED FROM:",to.redirectedFrom)
    
    const get_concepts = async (server, env) => {
      console.log("GETTING CONCEPTS")
      await Promise.all([fetch(`https://${server}.uib.no/opal/${env}/bm/concepts.json`).then(r => r.json()), fetch(`https://${server}.uib.no/opal/${env}/nn/concepts.json`).then(r => r.json())]).then(response => {
        store.concepts_bm = response[0].concepts
        store.concepts_nn = response[1].concepts
        store.endpoint = `https://${server}.uib.no/opal/${env}/`
        console.log("ENDPOINT:", store.endpoint)
    
    }).catch(async err => {
      if (server == 'oda') {
        console.log("Fallback to odd.uib.no")
        await get_concepts('odd', env)
        }
        else {
          console.log("Uncaught")
    
        }
      })
    }

    // More flexible api switching for testing purposes
    if (to.query && to.query.api) {
      store.endpoint = {'odd_dev': 'dev', 'oda_dev': 'dev', 'odd_prod': 'prod', 'oda_prod': 'prod'}[String(to.query.api)] || 'oda_dev'
      await get_concepts({'odd_dev': 'odd', 'oda_dev': 'oda', 'odd_prod': 'odd', 'oda_prod': 'oda'}[String(to.query.api)], store.endpoint)

    }
    else if (!store.endpoint) {
        await get_concepts(process.env.NODE_ENV == 'production' ? 'oda' : 'odd', 'prod')
    }
    
})