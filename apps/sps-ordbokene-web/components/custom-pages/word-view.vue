<template>
    <div>     
    <Spinner v-if="!error && !articles"/>    
    <div ref="results" v-if="!error && articles && articles.meta" >
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
              <Article :content_locale="content_locale(dict)" :list="listView" :article_id="article_id" :dict="dict" :idx="idx"/>
            </NuxtErrorBoundary>
          </component>
        </component>
          <div v-if="store.q && !specialSymbols(store.q)">
            <Suggest :content_locale="content_locale(dict)"  :dict="dict" :articles_meta="articles.meta"/>
          </div>
      </section>
      
  </div>
  <section v-if="!no_suggestions" class="pt-0 mb-12 mt-12 px-2" :class="{'text-center': store.dict == 'bm,nn'}" aria-labelledby="feedback_title">
              <h2 id="feedback_title">{{$t('notifications.feedback.title')}}</h2>
              <div v-if="!feedback_given" class="flex gap-4 mt-4 my-6 mb-8 h-10" :class="{'justify-center': store.dict == 'bm,nn'}">
                  <button @click="track_feedback(true)" class="p-2 btn px-5">{{$t('notifications.feedback.yes')}}<Icon class="text-primary ml-3" name="bi:hand-thumbs-up-fill"/></button>
                  <button @click="track_feedback(false)" class="p-2 btn px-5">{{$t('notifications.feedback.no')}}<Icon class="text-primary ml-3" name="bi:hand-thumbs-down-fill"/></button></div>
                  <p v-else class="mt-4 my-6 mb-8 justify-center h-10">
                  {{$t('notifications.feedback.thanks')}}
              </p>
        </section>
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
const no_suggestions = useState('no_suggestions', () => false)

const { pending, error, refresh, data: articles } = await useFetch('api/articles?', {
          baseURL: session.endpoint,
          params: {
            w: store.q,
            dict: store.dict,
            scope: 'e',
          }          
          })

const feedback_given = ref(false)

const track_feedback = (value) => {
    feedback_given.value = true
    useTrackEvent(value ? 'feedback_positive' : 'feedback_negative', {props: {query: store.dict + "/" + store.q}})

}

const content_locale = dict => {
  if (i18n.locale.value == "nob" || i18n.locale.value == 'nno') {
    return {bm: 'nob', nn: 'nno'}[dict] 
  }
  return i18n.locale.value
}

if (error.value && session.endpoint == "https://oda.uib.no/opal/prod/`") {
  session.endpoint = `https://odd.uib.no/opal/prod/`
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
  useTrackEvent("article_error", {props: {article: dict + "/" + article, message: dict + "/" + article + " " + error.toString()}})
  console.log(error)
}

</script>
