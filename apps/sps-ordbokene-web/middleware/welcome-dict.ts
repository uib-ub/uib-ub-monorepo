import { useSearchStore } from '~/stores/searchStore'
const store = useSearchStore()

export default defineNuxtRouteMiddleware((to) => {
    store.$reset()
  })