<template>
<main id="main" tabindex="-1" class="simple-search">
  <SearchNav v-if="route.name != 'search'"/>
    <NuxtErrorBoundary @error="form_error">
    <SearchForm v-if="route.name != 'search'" class="ord-container"/>
    <div v-if="route.name == 'article' && store.searchUrl" class="ord-container justify-start mt-2 pl-1 md:pl-0">
      <NuxtLink :to="store.searchUrl"> <Icon name="bi:arrow-left" size="1.25em" class="mb-1 mr-1 text-primary"/>{{$t('notifications.back')}}</NuxtLink>
    </div>
  </NuxtErrorBoundary>

    <div class="ord-container" v-bind:class="{'md:pt-4': route.name != 'article'}">
  <NuxtErrorBoundary @error="content_error">
    <NuxtPage/>
  </NuxtErrorBoundary>
    </div>
</main>
</template>

<script setup>
import { useSearchStore } from '~/stores/searchStore'
const store = useSearchStore()
const route = useRoute()


watch(() => route.query.q, () => {
  if (route.query.q) {
    store.q = route.query.q
    store.lemmas.bm = new Set()
    store.lemmas.nn = new Set()
  }
})

definePageMeta({
    middleware: [
      function (to, from) { // Sync store with routing
      const store = useSearchStore()
        
        let query = to.params.q || to.query.q
        if (to.params.dict)  {
          store.dict = to.params.dict
          
          if (query) {
            store.q = query
            store.lemmas.bm = new Set()
            store.lemmas.nn = new Set()
            store.input = to.query.orig || query
            store.searchUrl = to.fullPath
          }
        }
        else if (store.q) {
          console.log("RESET")
          store.$reset()
        }

        
      },
    ]
  })

useHead({
  link: [
    {rel: "canonical", href: "https://ordbokene.no/" + store.dict}
  ]
})

const form_error = (error) => {
  console.log("FORM ERROR",error)
}
const content_error = (error) => {
  console.log("CONTENT ERROR", error)
}

</script>
