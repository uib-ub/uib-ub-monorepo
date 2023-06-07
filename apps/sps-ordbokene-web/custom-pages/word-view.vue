<template>
    <div v-bind:class="{'list': listView}">     
    <Spinner v-if="pending"/>
    <div ref="results"  v-if="store.view != 'suggest' && !pending && !error && articles && articles.meta" >
    <div class="gap-3 lg:gap-8 grid lg:grid-cols-2" v-if="route.params.dict == 'bm,nn' || route.query.dict == 'bm,nn' ">
      <section class="lg:grid-cols-6" :aria-label="$t('dicts.bm')">
        <div class="hidden lg:inline-block py-2 px-1"><h2 class="lg:inline-block">Bokmålsordboka</h2>
          <span><span v-if="(articles.meta.bm.total > 1)" aria-hidden="true" class="result-count">  | {{$t('notifications.results', {count: articles.meta.bm.total})}}</span>
          </span></div>
          <div v-if="listView" class="inline-block lg:hidden"><h2>Bokmålsordboka</h2></div>
        <component :is="listView ? 'ol' : 'div'" class="article-column">
          <component v-for="(article_id, idx) in articles.articles.bm" :key="article_id" :is="listView ? 'li' : 'div'">
            <NuxtErrorBoundary v-on:error="article_error($event, article_id, 'bm')">
              <Article :article_id="article_id" dict="bm" :idx="idx"/>
            </NuxtErrorBoundary>
          </component>
        </component>
      </section>
      <section class="lg:grid-cols-6" :aria-label="$t('dicts.nn')">
        <div class="hidden lg:inline-block py-2 px-1"><h2 class="lg:inline-block">Nynorskordboka</h2>
          <span><span v-if="articles.meta.nn.total>1" aria-hidden="true" class="result-count">  | {{$t('notifications.results', {count: articles.meta.nn.total})}}</span>
          </span>
        </div>
        <div  v-if="listView" class="inline-block lg:hidden"><h2>Nynorskordboka</h2></div>
        <component class="article-column" :is="listView ? 'ol' : 'div'">
          <component v-for="(article_id, idx) in articles.articles.nn" :key="article_id" :is="listView ? 'li' : 'div'">
            <NuxtErrorBoundary v-on:error="article_error($event, article_id, 'nn')">
              <Article :article_id="article_id" dict="nn" :idx="idx"/>
            </NuxtErrorBoundary>
          </component>
        </component>
      </section>
  </div>

    
    <div v-if="route.params.dict != 'bm,nn' && route.query.dict != 'bm,nn' ">
      <div v-if="(route.params.dict == 'bm' || route.query.dict == 'bm') && articles.meta.bm">
        <div class="hidden lg:inline-block py-2 px-1"><h2 class="lg:inline-block">Bokmålsordboka</h2>
          <span v-if="(articles.meta.bm.total>1)" class="result-count">  | {{$t('notifications.results', {count: articles.meta.bm.total})}}</span>
        </div>
        <component class="article-column" :is="listView ? 'ol' : 'div'">
          <component v-for="(article_id, idx) in articles.articles.bm" :key="article_id" :is="listView ? 'li' : 'div'">
            <NuxtErrorBoundary v-on:error="article_error($event, article_id, 'bm')">
              <Article :article_id="article_id" dict="bm" :idx="idx"/>
            </NuxtErrorBoundary>
          </component>
        </component>
      </div>
      <div v-if="(route.params.dict == 'nn' || route.query.dict == 'nn' )  && articles.meta.nn">
        <div class="hidden lg:inline-block py-2 px-1"><h2 class="lg:inline-block">Nynorskordboka</h2>
          <span v-if="(articles.meta.nn.total>1)" class="result-count">  | {{$t('notifications.results', {count: articles.meta.nn.total})}}</span>
        </div>
        <component class="article-column" :is="listView ? 'ol' : 'div'">
          <component v-for="(article_id, idx) in articles.articles.nn" :key="article_id" :is="listView ? 'li' : 'div'">
            <NuxtErrorBoundary v-on:error="article_error($event, article_id, 'nn')">
              <Article :article_id="article_id" dict="nn" :idx="idx"/>
            </NuxtErrorBoundary>
          </component>
        </component>
      </div>
      
    </div>
  </div>
  <div v-if="error_message">
    {{error_message}}
  </div>
  <div v-if="error" aria-live="">
    ERROR: {{error}}
  </div>
  <client-only>
  <div class="my-10">
  <SuggestResults v-if="!pending && suggestions.inflect" :suggestions="suggestions.inflect">{{$t('notifications.other_inflected', {word: route.query.orig || store.q})}}</SuggestResults>
  <SuggestResults v-if="!pending && suggestions.similar" :suggestions="suggestions.similar">{{$t('notifications.similar')}}</SuggestResults>
  </div>
  </client-only>


</div>


</template>

<script setup>

import { useStore } from '~/stores/searchStore'
import {useSettingsStore } from '~/stores/settingsStore'
import { useI18n } from 'vue-i18n'

const settings = useSettingsStore()
const store = useStore()
const route = useRoute()
const { t } = useI18n()
const i18n = useI18n()

const suggestions = ref({inflect: [], similar: []})
const error_message = ref()


const get_suggestions = async () => {
  if (process.client) {
    const response = await $fetch(`${store.endpoint}api/suggest?&q=${route.query.orig || store.q}&dict=${store.dict}&n=10&dform=int&meta=n&include=eis`)                                
    suggestions.value = filterSuggestions(response, route.query.orig || store.q, store.q)
  }
}
onMounted(() => {
    get_suggestions()    
})


const { pending, error, refresh, data: articles } = await useAsyncData("articles_"+ store.searchUrl, ()=> 
      $fetch(store.endpoint + 'api/articles?', {
          params: {
            w: store.q,
            dict: store.dict,
            scope: 'e',
          },
          onRequestError({ request, options, error}) {
            console.log("ERROR")
          },

          onResponse({ request, options, response }) {
            get_suggestions()
          }
        }))


const title = computed(()=> {
  return store.dict == "bm,nn" ? store.q : store.q + " | " + t('dicts.'+ store.dict)
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




const listView = computed(() => {
  return store.q && store.view != "article" && settings.simpleListView && route.name == 'dict-slug'
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

ol.article-column>li {
  list-style: none;
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

.list .article-column:empty  {
    display: none;
}
</style>
