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
import { useSearchStore } from '~/stores/searchStore'
import { useRoute } from 'vue-router'
import { useSettingsStore } from '~/stores/settingsStore'
import { useSessionStore } from '~/stores/sessionStore'
import { useI18n } from 'vue-i18n'
const store = useSearchStore()
const route = useRoute()
const settings = useSettingsStore()
const session = useSessionStore()
const i18n = useI18n()

const input_element = useState('input_element')

const submitForm = async (item) => {
  
  if (typeof item === 'string') {
    if (settings.auto_select) {
      input_element.value.select()
    }
    else {
      input_element.value.blur()
    }
    return navigateTo(`/${store.dict}?q=${item}`)
  }
  
  if (store.input) {
    if (settings.auto_select) {
      input_element.value.select()
    }
    else {
      input_element.value.blur()
    }
    
    session.show_autocomplete = false
    store.q = store.input


    if (advancedSpecialSymbols(store.q)) {
      return navigateTo(`/search?q=${store.q}&dict=${store.dict}&scope=${store.scope}`)
    }
    else  if (store.input.includes("|") || session.dropdown_selected != -1) {
      return navigateTo(`/${store.dict}?q=${store.q}`)
    }

    let { exact, inflect } = store.suggest
    
    if (exact) {
      
        if (exact[0][0].length == store.q.length) {
            let redirectUrl = `/${store.dict}/${exact[0][0]}`
            if (exact[0][0] != store.q) redirectUrl += `?orig=${store.q}`
            return navigateTo(redirectUrl)
        }
    }

    if (inflect && inflect.length == 1 && inflect[0][0] && inflect[0][0][0] != "-" && inflect[0][0].slice(-1) != "-") { // suppress prefixes and suffixes
        return navigateTo(`/${inflect[0][0]}?orig=${store.q}`)
    }

    return navigateTo(`/${store.dict}?q=${store.q}`)
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