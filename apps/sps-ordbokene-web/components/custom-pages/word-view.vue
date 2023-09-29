<template>
    <div>     
    <Spinner v-if="pending"/>    
    <div ref="results" v-if="!pending && !error && articles && articles.meta" >
      <client-only><div class ="callout mx-2" v-if="route.query.orig"><Icon name="bi:info-circle-fill" class="mr-3 mb-1 text-primary"/>{{$t('notifications.redirect')}} <strong>{{route.params.q}}.</strong>
        </div>
      </client-only>
    <div v-bind:class="{'gap-2 lg:gap-8 grid lg:grid-cols-2': dicts.length == 2}">
      <section class="lg:grid-cols-6" v-for="dict in dicts" :key="dict" :aria-labelledby="dict+'_heading'">
        <div class="py-2 px-2">
          <h2 :id="dict+'_heading'" class="">{{$t('dicts.'+dict)}} 
            <span class="result-count-text">{{articles.meta[dict] && articles.meta[dict].total}}</span>
            <span class="sr-only">{{$t('notifications.keywords')}}</span>
          </h2>
        </div>
        <component v-if="articles.meta[dict] && articles.meta[dict].total" :is="listView ? 'ol' : 'div'" class="article-column">
          <component v-for="(article_id, idx) in articles.articles[dict]" :key="article_id" :is="listView ? 'li' : 'div'">
            <NuxtErrorBoundary v-on:error="article_error($event, article_id, dict)">
              <Article :list="listView" :article_id="article_id" :dict="dict" :idx="idx"/>
            </NuxtErrorBoundary>
          </component>
        </component>
          <client-only v-if="store.q && !specialSymbols(store.q)">
            <Suggest :dict="dict" :articles_meta="articles.meta"/>
          </client-only>
         
      </section>
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
const session = useSessionStore()
const route = useRoute()
const { t } = useI18n()
const i18n = useI18n()
const error_message = ref()

const { pending, error, refresh, data: articles } = await useAsyncData("articles_"+ store.searchUrl, ()=> 
      $fetch('api/articles?', {
          baseURL: session.endpoint,
          params: {
            w: store.q,
            dict: store.dict,
            scope: 'e',
          },
        }))

if (error.value && session.endpoint == "https://oda.uib.no/opal/prod/`") {
  session.endpoint = `https://odd.uib.no/opal/prod/`
  console.log("ERROR", error.value)
  refresh()
}


const title = computed(()=> {
  return store.dict == "bm,nn" ? store.q : store.q + " | " + t('dicts.'+ store.dict)
})

const dicts = computed(()=> {
  let currentDict = store.dict
  if (currentDict == "bm") {
    return ["bm"]
  }
  if (currentDict == "nn") {
    return ["nn"]
  }
  return ["bm", "nn"]
})


useHead({
  title, 
  meta: [
    {property: 'og:title', content: title }, 
  ],
  link: [
    {rel: "canonical", href: `https://ordbokene.no/${store.dict}/${route.params.q}`}
  ]
})

definePageMeta({
    middleware: [
      "simple-search-middleware"
    ]
  })


const listView = computed(() => {
  return store.q && settings.simpleListView
})



const article_error = (error, article, dict) => {
  console.log("ARTICLE_ERROR", article, dict)
  console.log(error)
}

</script>
