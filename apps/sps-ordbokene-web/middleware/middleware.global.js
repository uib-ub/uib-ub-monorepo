import { localizeUrl } from '../utils/helpers'
import { useSessionStore } from '~/stores/sessionStore'

export default defineNuxtRouteMiddleware((to, from) => {
  const session = useSessionStore()

  // Redirect if cookie or browser language don't match route locale
  const locale_cookie = useCookie('currentLocale')
  if (locale_cookie.value) {
    if (to.params.locale && locale_cookie.value !== to.params.locale) {
      return navigateTo(localizeUrl(to.fullPath, locale_cookie.value), {replace: true})
    }
  }
  else if (process.client) {
    try {
      if (navigator.language === 'nb' && to.params.locale !== 'nob') {
        return navigateTo(localizeUrl(to.fullPath, 'nob'), {replace: true})
      }
      else if (navigator.language === 'nn' && to.params.locale !== 'nno') {
        return navigateTo(localizeUrl(to.fullPath, 'nno'), {replace: true})
      }
      else if (navigator.language === 'uk' && to.params.locale !== 'ukr') {
        return navigateTo(localizeUrl(to.fullPath, 'ukr'), {replace: true})
      }
    }
    catch (err) {
      console.log(err)
    }
    
  }

  
  if (!session.endpoint) {
    session.endpoint = useRuntimeConfig().public.api
  }
  

  
})