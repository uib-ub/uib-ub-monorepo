<template>
<div class="pt-1 pb-2 lg:pb-1">
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
  if (store.input) {
    store.show_autocomplete = false
    store.q = store.input

    let { exact, inflect } = store.suggest
    
    if (exact) {
        if (exact[0][0].length == store.q.length) {
            let redirectUrl = `/${store.dict}/${exact[0][0]}`
            if (exact[0][0] != store.q) redirectUrl += `?orig=${store.q}`
            return navigateTo(redirectUrl)
        }
    }
    if (inflect) {
        return navigateTo(`/${store.dict}/${inflect[0][0]}?orig=${store.q}`)
    }


    navigateTo(`/${route.params.dict}?q=${store.q}`)
    //navigateTo(`/${route.params.dict}/${store.q}`)
  }
  
}

const autocomplete_error = (error) => {
  console.log(error)
}

</script>

<style scoped>




.welcome form {
  @apply md:mx-0;
}

  

</style>