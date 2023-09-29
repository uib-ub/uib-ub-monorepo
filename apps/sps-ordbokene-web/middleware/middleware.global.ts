import { localizeUrl } from '../utils/helpers'
import { useSessionStore } from '~/stores/sessionStore'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const session = useSessionStore()

  // Redirect if cookie or browser language don't match route locale
  try {
    const locale_cookie = useCookie('currentLocale')
    if (locale_cookie.value) {
      if (to.params.locale && locale_cookie.value != to.params.locale) {
        return navigateTo(localizeUrl(to.fullPath, locale_cookie.value))
      }
    }
    else if (navigator.language == 'nb' && to.params.locale != 'nob') {
      return navigateTo(localizeUrl(to.fullPath, 'nob'))
    }
    else if (navigator.language == 'nn' && to.params.locale != 'nno') {
      return navigateTo(localizeUrl(to.fullPath, 'nno'))
    }
    else if (navigator.language == 'uk' && to.params.locale != 'ukr') {
      return navigateTo(localizeUrl(to.fullPath, 'ukr'))
    }

  }
   catch (exception) {
    console.log("MIDDLEWARE ERROR", exception)
  }


  
  // Load concepts for definition expansion
  const get_concepts = async (server, env) => {
    await Promise.all([fetch(`https://${server}.uib.no/opal/${env}/bm/concepts.json`).then(r => r.json()), fetch(`https://${server}.uib.no/opal/${env}/nn/concepts.json`).then(r => r.json())]).then(response => {
      session.concepts_bm = response[0].concepts
      session.concepts_nn = response[1].concepts
      session.endpoint = `https://${server}.uib.no/opal/${env}/`
      console.log("ENDPOINT:", session.endpoint)
  
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
    session.endpoint = {'odd_dev': 'dev', 'oda_dev': 'dev', 'odd_prod': 'prod', 'oda_prod': 'prod'}[String(to.query.api)] || 'oda_dev'
    await get_concepts({'odd_dev': 'odd', 'oda_dev': 'oda', 'odd_prod': 'odd', 'oda_prod': 'oda'}[String(to.query.api)], session.endpoint)

  }
  else if (!session.endpoint) {
      await get_concepts(process.env.NODE_ENV == 'production' ? 'oda' : 'odd', 'prod')
  }
  
})