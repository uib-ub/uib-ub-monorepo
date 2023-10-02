<template>
  <div v-bind:class="{'list': settings.listView}">     
  <Spinner v-if="pending"/>
  <div v-if="!pending && !error && articles && articles.meta" >
  <div  v-bind:class="{'gap-2 lg:gap-8 grid lg:grid-cols-2': dicts.length == 2}">
    <section class="lg:grid-cols-6" v-for="dict in dicts" :key="dict" :aria-labelledby="dict+'_heading'">
      <div class="py-2 px-2">
        <h2 :id="dict+'_heading'" class="">{{$t('dicts.'+dict)}} 
          <span class="result-count-text">{{articles.meta[dict].total}}</span>
          <span class="sr-only">{{$t('notifications.keywords')}}</span>
        </h2>
      </div>
      <client-only>
        <MinimalSuggest :content_locale="content_locale(dict)" v-if="articles.meta[dict].total == 0" :dict="dict"/>
      </client-only>
      <component v-if="articles.meta[dict].total > 0" :is="settings.listView ? 'ol' : 'div'" class="article-column">
        <component v-for="(article_id, idx) in articles.articles[dict].slice(offset, offset + perPage)" :key="article_id" :is="settings.listView ? 'li' : 'div'">
          <NuxtErrorBoundary v-on:error="article_error($event, article_id, dict)">
            <Article :content_locale="content_locale(dict)" :article_id="article_id" :dict="dict" :idx="idx" :list="settings.listView"/>
          </NuxtErrorBoundary>
        </component>
      </component>
    </section>
</div>

  
  <div class ="flex flex-col">
  <div v-if="pages > 1" class="p-2 py-6 md:p-8 flex md:flex-wrap justify-center flex md:gap-4">
    <NuxtLink :to="{query: {...route.query, ...{page: page -1 }}}">
      <button :disabled="page == 1" class="bg-primary text-white rounded-4xl p-1 px-2 md:p-3 md:px-8">
        <Icon name="bi:chevron-left" class="md:mr-0.75em mb-0.125em"/><span class="sr-only md:not-sr-only">{{$t('previous-page') }}</span>
      </button>
    </NuxtLink>
  <div class="text-center self-center align-middle mx-4 md:mx-8 text-lg h-full">{{$t('pageof', {page, pages})}}</div>
  <NuxtLink :to="{query: {...route.query, ...{page: page + 1 }}}">
    <button :disabled="page == pages" class="bg-primary text-white rounded-4xl p-1 px-2 md:p-3 md:px-8">
      <span class="sr-only md:not-sr-only">{{$t('next-page')}}</span><Icon name="bi:chevron-right" class="md:ml-0.75em mb-0.125em"/>
    </button>
  </NuxtLink>
  </div>
  <div class="block self-center" v-if="articles.meta.bm && articles.meta.bm.total > 10 || articles.meta.nn && articles.meta.nn.total > 10">
    <button @click="goToTop" class="go-top-button"><Icon name="bi:arrow-up-circle-fill" size="1.25em" class="mr-3 text-primary" />{{$t('to_top')}}</button>
  <label class="px-3" for="perPage-select">{{$t('per_page')}}</label>
  <select id="perPage-select" name="pos" class="bg-tertiary border border-1 py-1 px-2 pr-2 mr-2" v-model="perPage" @change="update_perPage">
    <option v-for="num in [10, 20, 50, 100]" :key="num" :value="num" :selected="settings.perPage">{{num}}</option></select>
  </div>
  </div>
</div>
<div v-if="error_message">
  {{error_message}}
</div>
<div v-if="error" aria-live="">
  ERROR: {{error}}
</div> 

</div>


</template>

<script setup>

import { useSearchStore } from '~/stores/searchStore'
import {useSettingsStore } from '~/stores/settingsStore'
import {useSessionStore } from '~/stores/sessionStore'
import { useI18n } from 'vue-i18n'

const settings = useSettingsStore()
const store = useSearchStore()
const route = useRoute()
const session = useSessionStore()
const i18n = useI18n()

const error_message = ref()

const page = computed(() => {
return parseInt(route.query.page) || 1
})

const perPage = ref(parseInt(route.query.perPage) || settings.perPage)


const query = computed(() => {
  const params = {
    w: route.query.q,
    dict: route.query.dict || 'bm,nn',
  }
  if (route.query.scope) {
    params.scope = route.query.scope
  }
  if (route.query.pos) {
    params.wc = store.pos
  }
    return params
})


const content_locale = dict => {
  return {bm: 'nob', nn: 'nno'}[dict] || i18n.locale.value
}

const { pending, error, refresh, data: articles } = await useFetch(() => `api/articles?`, {
          query,
          baseURL: session.endpoint,
          onResponseError(conf) {
            console.log("RESPONSE ERROR")
          }
        })

const dicts = computed(()=> {
let currentDict = route.query.dict 
if (currentDict == "bm") {
  return ["bm"]
}
if (currentDict == "nn") {
  return ["nn"]
}
return ["bm", "nn"]
})


if (error.value && session.endpoint == "https://oda.uib.no/opal/prod/`") {
  session.endpoint = `https://odd.uib.no/opal/prod/`
  console.log("ERROR", error.value)
  refresh()
} 


const pages = computed(() => {
  let total_bm = articles.value.meta.bm ? articles.value.meta.bm.total : 0
  let total_nn = articles.value.meta.nn ? articles.value.meta.nn.total : 0
  return Math.ceil(Math.max(total_bm, total_nn) / perPage.value)
})


const offset = computed(() => {
  return perPage.value * (page.value - 1)

})


const update_perPage = (event) => {
  settings.perPage = perPage
  page.value = 1
  return navigateTo({query: {...route.query, ...{perPage: event.target.value, page: 1}}})
}

const update_page = value => {
  page.value += value
  return navigateTo({query: {...route.query, ...{page: page.value}}})

}


const article_error = (error, article, dict) => {
  console.log("ARTICLE_ERROR", article, dict)
  console.log(error)
}


const goToTop = () => {
window.scrollTo({
  top: 0,
  behavior: 'smooth'
});
}
</script>

<style scoped>



button[disabled] {
  @apply cursor-default bg-gray-100;
}

.announcement:focus-within .snackbar-search {
  /* display: absolute !important; */
  @apply  bottom-4 !absolute;

}


.go-top-button{
  @apply text-black font-medium rounded transition duration-200 cursor-pointer px-4 py-2 motion-reduce:transition-none;
}

.go-top-button:hover{
  @apply bg-tertiary-darken1;
}
</style>