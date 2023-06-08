<template>
<main id="main" tabindex="-1" class="dict-view simple-search py-1">
  <SearchNav v-if="!store.advanced"/>
    <NuxtErrorBoundary @error="form_error">
    <SearchForm v-if="!store.advanced" class="ord-container"/>
    <div v-if="route.name == 'article' && store.searchUrl" class="ord-container back-to-search justify-start my-2">
      <NuxtLink :to="store.searchUrl"> <Icon name="bi:arrow-left" size="1.25em" class="mb-1 mr-1 text-primary"/>{{$t('notifications.back')}}</NuxtLink>
    </div>
  </NuxtErrorBoundary>

  
  <section class="dict-content">
    <div class="ord-container">
  <NuxtErrorBoundary @error="content_error">
    <NuxtPage/>
  </NuxtErrorBoundary>
  <Suggest v-if="store.q"/>
    </div>
  </section>

</main>
</template>

<script setup>
import { useStore } from '~/stores/searchStore'
const store = useStore()
const route = useRoute()


watch(() => route.query.q, () => {
  console.log("NAVIGATING")
  if (route.query.q) {
    store.q = route.query.q
    navigateTo(store.dict + "/" + route.query.q)
  }
})

definePageMeta({
    middleware: [
      function (to, from) { // Sync store with routing
        const store = useStore()
        store.dict = to.params.dict
        let query = to.params.q || to.query.q
        if (query) {
          store.q = query
          store.input = to.query.orig || query
          store.searchUrl = to.fullPath
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
