import { useStore } from '~/stores/searchStore'
const store = useStore()

export default defineNuxtRouteMiddleware((to) => {
  store.$reset()
    return '/'+store.dict
  })