<template>
  <main id="main" tabindex="-1" class="dict-view simple-search py-1">
    <SearchNav v-if="!store.advanced"/>
      <NuxtErrorBoundary @error="form_error">
      <SearchForm v-if="!store.advanced" class="ord-container"/>
    </NuxtErrorBoundary>
  
    
    <section class="dict-content">
      <div class="ord-container">
    <NuxtErrorBoundary @error="content_error">
      <NuxtPage/>
    </NuxtErrorBoundary>
      </div>
    </section>
  
  </main>
  </template>
  
  <script setup>
  import { useStore } from '~/stores/searchStore'
  import { useRoute } from 'vue-router'
  const store = useStore()
  const route = useRoute()
  
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
  
  const dict_click = (dict) => {
    store.advanced = false
    store.dict = dict
    if (store.q != store.input) {
      store.input = store.q
    }
  }
  
  
  const advanced_link = computed(() => {
    if (store.advanced) {
      return route.fullPath
    }
    else {
      let url = route.fullPath
      if (route.name == 'dict') {
        return `/${store.dict}?scope=${store.scope}`
      }
      else if (route.name == "dict-slug") {
        return  `/${store.dict}/search?q=${store.q}&scope=${store.scope}`
      }
      else if (!route.query.scope) {
        return url + "&scope=" + store.scope
  
      }
      else {
        return url
      }
    }
    
  })
  
  const dict_link = ((dict) => {
    let url = `/${dict}/`
    if (specialSymbols(store.q)) {
      return  url
    }
    if (store.q) {
      url = url + 'search?q=' + store.q
    }
    return url
    
  })
  
  
  
  </script>
  