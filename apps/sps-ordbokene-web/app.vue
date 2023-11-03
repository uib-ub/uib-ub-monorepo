<template>
<Html :lang="locale">
  <Head>
    <Title v-if="$route.params.dict == 'nn'">Nynorskordboka</Title>
    <Title v-if="$route.params.dict == 'bm'">Bokmålsordboka</Title>
    <Meta name="robots" content="noindex,nofollow"/>
    <Link v-if="route.name == 'index' || route.name == 'welcome'" rel="canonical" :href="'https://ordbokene.no' + non_localized"/><!-- TODO: remove when whe replace the old site -->
    <Link v-if="route.name == 'about'" rel="canonical" :href="'https://ordbokene.no/om'"/><!-- TODO: remove when whe replace the old site -->
    <Link rel="alternate" :href="baseUrl + non_localized" hreflang="x-default"/>
    <Link rel="alternate" :href="baseUrl + '/nob' + non_localized" hreflang="nb"/>
    <Link rel="alternate" :href="baseUrl + '/nno' + non_localized" hreflang="nn"/>
    <Link rel="alternate" :href="baseUrl + '/ukr' + non_localized" hreflang="uk"/>
    <Meta name="description" :content="description"/>
    <Meta name="twitter:description" :content="description"/>
    <Meta property="og:description" :content="description"/>
    <Meta name="twitter:title" :content="metaTitle"/>
    <Meta property="og:title" :content="metaTitle"/>
    <Meta name="twitter:image" :content="baseUrl +'/logo.png'"/>
    <Meta property="og:type" content="website"/>
    <Meta property="og:site_name" content="ordbøkene.no"/>
    <Meta property="og:image" :content="baseUrl +'/logo.png'"/>
    <Meta property="og:image:width" content="256px"/>
    <Meta property="og:image:height" content="256px"/>
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

const { api, apiFallback, apiDev, apiDevFallback } = useRuntimeConfig().public


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

const description = computed(() => {
  return i18n.t('footer_description', {bm: "Bokmålsordboka", nn: "Nynorskordboka"})
})


const titleTemplate = (titleChunk) => {
  return titleChunk ? `${titleChunk} - ordbøkene.no` : 'ordbøkene.no';

}

const metaTitle = computed(() => {
  return titleTemplate({bm: "Bokmålsordboka", nn: "Nynorskordboka"}[route.params.dict] || i18n.t('sub_title'))
})

useHead({
    titleTemplate
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


const { data: concepts, error, refresh} = await useAsyncData('concepts', async () => {
  const [concepts_bm, concepts_nn] = await Promise.all([$fetch(`${session.endpoint}bm/concepts.json`), $fetch(`${session.endpoint}nn/concepts.json`)])

  return {
    concepts_bm,
    concepts_nn
  }
})

if (error.value && session.endpoint == api) {
  session.endpoint = apiFallback
  await refresh()
}

if (error.value && session.endpoint == apiDev) {
  session.endpoint = apiDevFallback
  await refresh()
}

session.concepts_bm = concepts.value.concepts_bm.concepts
session.concepts_nn = concepts.value.concepts_nn.concepts


</script>

