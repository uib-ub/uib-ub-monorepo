import { useSearchStore } from '~/stores/searchStore'
export default defineNuxtRouteMiddleware(async (to, from) => {
    const store = useSearchStore()
    store.$reset()
})