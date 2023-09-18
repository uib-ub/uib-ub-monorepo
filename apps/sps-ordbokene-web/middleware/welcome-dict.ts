import { useStore } from '~/stores/searchStore'
const store = useStore()

export default defineNuxtRouteMiddleware((to) => {
    store.$reset()
    if (to.params.locale) {
      return '/'+ to.params.locale+ '/' + store.dict
    
    }
    return '/'+store.dict
  })