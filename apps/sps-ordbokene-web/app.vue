<template>
<Html :lang="locale">
  <Head>
    <Link rel="alternate" :href="baseUrl + non_localized" hreflang="x-default"/>
    <Link rel="alternate" :href="baseUrl + '/nob' + non_localized" hreflang="nb"/>
    <Link rel="alternate" :href="baseUrl + '/nno' + non_localized" hreflang="nn"/>
    <Link rel="alternate" :href="baseUrl + '/ukr' + non_localized" hreflang="uk"/>
    <Meta name="robots" content="noindex,nofollow"/>
  </Head>
<NuxtLayout>
    <NuxtPage @click="menu_expanded=false"
              v-bind:class="{'welcome': route.name == 'welcome' || route.name == 'index'}"/>
</NuxtLayout>
</Html>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useSearchStore } from '~/stores/searchStore'
import { useRoute } from 'vue-router'
import { useSettingsStore } from './stores/settingsStore'
import { useSessionStore } from './stores/sessionStore'
const store = useSearchStore()
const session = useSessionStore()
const settings = useSettingsStore()
const route = useRoute()
const i18n = useI18n()

const input_element = useState('input_element')
const baseUrl = useRequestURL().protocol+'//'+useRequestURL().host

const locale = computed(()=> {
  return {nob: 'nb', nno: 'nn', eng: 'en'}[i18n.locale.value]
})

const non_localized = computed (() => {
  if (route.params.locale) {
    return route.fullPath.slice(1 + route.params.locale.length, route.fullPath.length)
  }
  else return route.fullPath
})

useHead({
    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} - ordbøkene.no` : 'ordbøkene.no';
    },
    meta: [
      {name:"twitter:title" , content:"Ordbøkene.no - Bokmålsordboka og Nynorskordboka"},
      {name:"twitter:image" , content:"logo.png"},
      {name:"twitter:description" , content:"Bokmålsordboka og Nynorskordboka viser skrivemåte og bøying i tråd med norsk rettskriving. Språkrådet og Universitetet i Bergen står bak ordbøkene."},
      {property:"og:title" , content:"Ordbøkene.no - Bokmålsordboka og Nynorskordboka"},
      {property:"og:type" , content:"website"},
      {property:'og:site_name' , content:"ordbokene.no"},
      {property:'og:image' , content: baseUrl + "/logo.png"},
      {property:"og:image:width" , content:"256px"},
      {property:"og:image:height" , content:"256px"},
      {property:"og:description" , content:"Bokmålsordboka og Nynorskordboka viser skrivemåte og bøying i tråd med norsk rettskriving. Språkrådet og Universitetet i Bergen står bak ordbøkene."},
      {name:"og:description" , content:"Bokmålsordboka og Nynorskordboka viser skrivemåte og bøying i tråd med norsk rettskriving. Språkrådet og Universitetet i Bergen står bak ordbøkene."}
      ]
})



// Global event listeners
if (process.client) {
  document.addEventListener('click', () => {
  session.show_autocomplete = false
  })
}

const nuxtApp = useNuxtApp()

nuxtApp.hook("page:finish", () => {
  if (input_element.value && settings.autoSelect && !isMobileDevice()) {
    input_element.value.select()
  }
})


</script>

