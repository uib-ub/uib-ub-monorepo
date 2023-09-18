import { useStore } from '~/stores/searchStore'
const store = useStore()

export default defineNuxtRouteMiddleware((to) => {
    store.$reset()
    let locale = to.params.locale
    if (!locale) {
      try {
        locale = useCookie("currentLocale", {default: () => new Date().getDate() % 2 ? 'nno' : 'nob'}).value
      } catch (error) {
        console.log(error)
        locale = (new Date().getDate() % 2 ? 'nno' : 'nob')
      }
    }
    return '/'+ locale + '/' + store.dict
  })