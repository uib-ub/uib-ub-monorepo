<template>
<div class="lg:py-1">
<form ref="form" class="md:mx-[10%]" :action="`/${$i18n.locale}/${store.dict || 'bm,nn'}`" @submit.prevent="submitForm"  >
<NuxtErrorBoundary @error="autocomplete_error">
  <Autocomplete @dropdown-submit="submitForm"/>
</NuxtErrorBoundary>

</form>
</div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSearchStore } from '~/stores/searchStore'
import { useSettingsStore } from '~/stores/settingsStore'
import { useSessionStore } from '~/stores/sessionStore'

const store = useSearchStore()
const route = useRoute()
const settings = useSettingsStore()
const session = useSessionStore()
const i18n = useI18n()

const input_element = useState('input_element')

const submitForm = (item) => {
  
  if (typeof item === 'string') {
    if (settings.auto_select && !isMobileDevice()) {
      input_element.value.select()
    }
    else {
      input_element.value.blur()
    }
    return navigateTo(`/${i18n.locale.value}/${store.dict}?q=${item}`)
  }
  
  if (store.input) {
    if (settings.auto_select && !isMobileDevice()) {
      input_element.value.select()
    }
    else {
      input_element.value.blur()
    }
    
    session.show_autocomplete = false
    store.q = store.input


    if (advancedSpecialSymbols(store.q)) {
      return navigateTo(`/${i18n.locale.value}/search?q=${store.q}&dict=${store.dict}&scope=${store.scope}`)
    }
    else  if (store.input.includes("|") || session.dropdown_selected !== -1) {
      return navigateTo(`/${i18n.locale.value}/${store.dict}?q=${store.q}`)
    }

    const { exact, inflect } = store.suggest
    
    if (exact) {
      
        if (exact[0][0].length === store.q.length) {
            const redirectUrl = `/${i18n.locale.value}/${store.dict}/${exact[0][0]}`
            return navigateTo(redirectUrl)
        }
    }

    if (inflect && inflect.length === 1 && inflect[0][0] && inflect[0][0][0] !== "-" && inflect[0][0].slice(-1) !== "-") { // suppress prefixes and suffixes
        return navigateTo(`/${i18n.locale.value}/${store.dict}/${inflect[0][0]}?orig=${store.q}`)
    }

    return navigateTo(`/${i18n.locale.value}/${store.dict}?q=${store.q}`)
    // navigateTo(`/${route.params.dict}/${store.q}`)
  }
  
}

const autocomplete_error = (error) => {
  console.log(error)
}

</script>