<template>
<div class="py-1">
<form  @submit.prevent="submitForm" ref="form" :action="'/' + store.dict || 'bm,nn'">
<NuxtErrorBoundary @error="autocomplete_error">
  <Autocomplete v-on:dropdown-submit="submitForm"/>
</NuxtErrorBoundary>

</form>
</div>
</template>

<script setup>
import { useStore } from '~/stores/searchStore'
import { useRoute } from 'vue-router'
const store = useStore()
const route = useRoute()

const submitForm = async (item) => {
  if (typeof item === 'string') {
    return navigateTo(`/${route.params.dict}?q=${item}`)
  }
  if (store.input) {
    store.show_autocomplete = false
    store.q = store.input


    if (advancedSpecialSymbols(store.q)) {
      return navigateTo(`/search?q=${store.q}&dict=${store.dict}&scope=${store.scope}`)
    }
    else  if (store.input.includes("|") || store.dropdown_selected != -1) {
      return navigateTo(`/${route.params.dict}?q=${store.q}`)
    }

    let { exact, inflect } = store.suggest
    
    if (exact) {
      
        if (exact[0][0].length == store.q.length) {
            let redirectUrl = `/${store.dict}/${exact[0][0]}`
            if (exact[0][0] != store.q) redirectUrl += `?orig=${store.q}`
            return navigateTo(redirectUrl)
        }
    }
    if (inflect && inflect[0][0] && inflect[0][0][0] != "-" && inflect[0][0].slice(-1) != "-") { // suppress prefixes and suffixes
        return navigateTo(`/${store.dict}/${inflect[0][0]}?orig=${store.q}`)
    }

    return navigateTo(`/${route.params.dict}?q=${store.q}`)
    //navigateTo(`/${route.params.dict}/${store.q}`)
  }
  
}

const autocomplete_error = (error) => {
  console.log(error)
}

</script>

<style scoped>
form {
      @apply md:mx-10;
    }

.welcome form {
  @apply lg:mx-0;
}

  

</style>