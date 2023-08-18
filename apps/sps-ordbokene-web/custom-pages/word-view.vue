<template>
    <div v-bind:class="{'list': listView}">     
    <Spinner v-if="pending"/>    
    <div ref="results" v-if="!pending && !error && articles && articles.meta" >
      <client-only><div class ="callout" v-if="route.query.orig"><Icon name="bi:info-circle-fill" class="mr-3 mb-1 text-primary"/>{{$t('notifications.redirect')}} <strong>{{route.params.q}}.</strong>
      
      <div v-if="additionalSuggest">
          <span v-for="(item, idx) in additionalSuggest" :key="idx">
            Se også: <NuxtLink noPrefetch class="suggest-link p-3 md:py-0 w-full" :to="item[0]"><Icon name="bi:search" class="mr-3 mb-1"/><span class="link-content">{{item[0]}}</span></NuxtLink>
        </span>
      </div>
        </div>
      </client-only>
    <div v-bind:class="{'gap-3 lg:gap-8 grid lg:grid-cols-2': dicts.length == 2}">
      <section class="lg:grid-cols-6" v-for="dict in dicts" :key="dict" :aria-label="$t('dicts.'+dict)">
        <div class="py-2 px-1"><h2 class="lg:inline-block">{{$t('dicts.'+dict)}}</h2>
          <span><span v-if="(articles.meta[dict].total > 1)" aria-hidden="true" class="result-count">  | {{$t('notifications.results', {count: articles.meta[dict].total})}}</span>
          </span></div>
        <component v-if="articles.meta[dict].total" :is="listView ? 'ol' : 'div'" class="article-column">
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

import { useStore } from '~/stores/searchStore'
import {useSettingsStore } from '~/stores/settingsStore'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const settings = useSettingsStore()
const store = useStore()
const route = useRoute()
const { t } = useI18n()
const i18n = useI18n()
const error_message = ref()

const { pending, error, refresh, data: articles } = await useAsyncData("articles_"+ store.searchUrl, ()=> 
      $fetch('api/articles?', {
          baseURL: store.endpoint,
          params: {
            w: store.q,
            dict: store.dict,
            scope: 'e',
          },
          onRequestError({ request, options, error}) {
            console.log("ERROR")
          }
        }))


const title = computed(()=> {
  return store.dict == "bm,nn" ? store.q : store.q + " | " + t('dicts.'+ store.dict)
})

const dicts = computed(()=> {
  let currentDict = route.params.dict || route.query.dict
  return currentDict == 'bm,nn' ? ["bm", "nn"] : [currentDict]
})


const additionalSuggest = computed(() => {
  if (route.query.orig && store.suggest.inflect) {
    return store.suggest.inflect.filter(item => item[0] != store.q)

  }
  else {
    return []
  }
  
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
      "pattern-redirect"
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
<style scoped>
.result-count {
    font-size: 1rem;
}


.list ol.article-column {
  margin: 0px;
  padding: 0px;
}

.list .article-column  {
    border: solid 1px rgba(0,0,0, .5);
    @apply bg-white;
    box-shadow: 2px 2px 0px rgba(0,0,0, .5);
    padding: 0rem;
    width: 100%;
}

.article-column {
  margin-bottom: 2rem !important;
}


</style>
