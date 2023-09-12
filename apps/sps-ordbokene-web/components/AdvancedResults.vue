<template>
    <div v-bind:class="{'list': settings.listView}">     
    <Spinner v-if="pending"/>

    <div v-if="!pending && !error && articles && articles.meta" >
    <!-- todo: accessibility info -->

    <div class="gap-3 lg:gap-8 grid lg:grid-cols-2" v-if="route.query.dict == 'bm,nn' ">
      <section class="lg:grid-cols-6" aria-labelledby="bm_heading">
        <div class="py-2 px-2">
          <h2 id="bm_heading" class="">{{$t('dicts.bm')}} 
            <span class="result-count-text">{{articles.meta.bm.total}}</span>
            <span class="sr-only">{{$t('notifications.keywords')}}</span>
          </h2>
        </div>
        <client-only>
          <MinimalSuggest v-if="articles.meta.bm.total == 0" dict="bm"/>
        </client-only>
        <component :is="settings.listView ? 'ol' : 'div'" class="article-column">
          <component v-for="(article_id, idx) in sliced_articles.bm" :key="article_id" :is="settings.listView ? 'li' : 'div'">
            <NuxtErrorBoundary v-on:error="article_error($event, article_id, 'bm')">
              <Article :article_id="article_id" dict="bm" :idx="idx" :list="settings.listView"/>
            </NuxtErrorBoundary>
          </component>
        </component>
      </section>
      <section class="lg:grid-cols-6" aria-labelledby="nn_heading">
        <div class="py-2 px-2">
          <h2 id="nn_heading" class="">{{$t('dicts.nn')}} 
            <span class="result-count-text">{{articles.meta.nn.total}}</span>
            <span class="sr-only">{{$t('notifications.keywords')}}</span>
          </h2>
        </div>
        <client-only>
          <MinimalSuggest v-if="articles.meta.nn.total == 0" dict="nn"/>
        </client-only>
        <component class="article-column" :is="settings.listView ? 'ol' : 'div'">
          <component v-for="(article_id, idx) in sliced_articles.nn" :key="article_id" :is="settings.listView ? 'li' : 'div'">
            <NuxtErrorBoundary v-on:error="article_error($event, article_id, 'nn')">
              <Article :article_id="article_id" dict="nn" :idx="idx" :list="settings.listView"/>
            </NuxtErrorBoundary>
          </component>
        </component>
      </section>
  </div>

    
    <div v-if="route.query.dict != 'bm,nn' ">
      <section v-if="route.query.dict == 'bm' && articles.meta.bm" aria-labelledby="bm_heading">
        <div class="py-2 px-2">
          <h2 id="bm_heading" class="">{{$t('dicts.bm')}} 
            <span class="result-count-text">{{articles.meta.bm.total}}</span>
            <span class="sr-only">{{$t('notifications.keywords')}}</span>
          </h2>
        </div>
        <client-only>
          <MinimalSuggest v-if="articles.meta.bm.total == 0" dict="bm"/>
        </client-only>
        <component class="article-column" :is="settings.listView ? 'ol' : 'div'">
          <component v-for="(article_id, idx) in sliced_articles.bm" :key="article_id" :is="settings.listView ? 'li' : 'div'">
            <NuxtErrorBoundary v-on:error="article_error($event, article_id, 'bm')">
              <Article :article_id="article_id" dict="bm" :idx="idx" :list="settings.listView"/>
            </NuxtErrorBoundary>
          </component>
        </component>
      </section>
      <section v-if="(route.query.dict == 'nn' )  && articles.meta.nn" aria-labelledby="nn_heading">
        <div class="py-2 px-2">
          <h2 id="nn_heading" class="">{{$t('dicts.nn')}} 
            <span class="result-count-text">{{articles.meta.nn.total}}</span>
            <span class="sr-only">{{$t('notifications.keywords')}}</span>
          </h2>
        </div>
        <client-only>
          <MinimalSuggest v-if="articles.meta.nn.total == 0" dict="nn"/>
        </client-only>
        <component class="article-column" :is="settings.listView ? 'ol' : 'div'">
          <component v-for="(article_id, idx) in sliced_articles.nn" :key="article_id" :is="settings.listView ? 'li' : 'div'">
            <NuxtErrorBoundary v-on:error="article_error($event, article_id, 'nn')">
              <Article :article_id="article_id" dict="nn" :idx="idx" :list="settings.listView"/>
            </NuxtErrorBoundary>
          </component>
        </component>
      </section>
      
    </div>
    <div v-if="true || pages > 1" class="p-2 py-6 md:p-8 flex md:flex-wrap justify-center flex md:gap-4">
    <NuxtLink :to="{query: {...route.query, ...{page: page - 1}}}" @click="page -= 1"><button :disabled="page == 1" class="bg-primary text-white rounded-4xl p-1 px-2 md:p-3 md:px-8">
      <Icon name="bi:chevron-left" class="md:mr-0.75em mb-0.125em"/><span class="sr-only md:not-sr-only">{{$t('previous-page') }}</span>
    </button></NuxtLink>
    <div class="text-center self-center align-middle mx-4 md:mx-8 text-lg h-full">{{$t('pageof', {page, pages})}}</div>
    <NuxtLink :to="{query: {...route.query, ...{page: page + 1 }}}" @click="page += 1"><button :disabled="page == pages" class="bg-primary text-white rounded-4xl p-1 px-2 md:p-3 md:px-8">
      <span class="sr-only md:not-sr-only">{{$t('next-page')}}</span><Icon name="bi:chevron-right" class="md:ml-0.75em mb-0.125em"/>
    </button></NuxtLink>
    </div>

    <select v-model="perPage" @change="update_perPage">
      <option v-for="num in [10, 20, 50, 100]" :key="num" :value="num" :selected="settings.perPage">{{num}}</option></select>
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

import { computed } from 'vue'
import { useStore } from '~/stores/searchStore'
import {useSettingsStore } from '~/stores/settingsStore'

const settings = useSettingsStore()
const store = useStore()
const route = useRoute()

const error_message = ref()

const page = ref(parseInt(parseInt(route.query.page) || 1))
const perPage = ref(parseInt(route.query.perPage) || settings.perPage)

const { pending, error, refresh, data: articles } = await useFetch(() => `api/articles?w=${route.query.q}&dict=${route.query.dict}&scope=${route.query.scope}&wc=${route.query.pos||''}`, {
          baseURL: store.endpoint,
          onResponseError(conf) {
            console.log("RESPONSE ERROR")
          }
        })

if (error.value && store.endpoint == "https://oda.uib.no/opal/prod/`") {
  store.endpoint = `https://odd.uib.no/opal/prod/`
  console.log("ERROR", error.value)
  refresh()
}

console.log(articles.value)

const pages = computed(() => {
    let total_bm = articles.value.meta.bm ? articles.value.meta.bm.total : 0
    let total_nn = articles.value.meta.nn ? articles.value.meta.nn.total : 0
    return Math.ceil(Math.max(total_bm, total_nn) / perPage.value)
})


const offset = computed(() => {
  return perPage.value * page.value
  
})


const sliced_articles = computed(() => {
  return {
    bm: articles.value.articles.bm ? articles.value.articles.bm.slice(offset, perPage.value) : [],
    nn: articles.value.articles.nn ? articles.value.articles.nn.slice(offset, perPage.value) : []
  }
})



const update_perPage = (event) => {
  settings.perPage = perPage
  page.value = 1
  return navigateTo({query: {...route.query, ...{perPage: event.target.value, page: 1}}})
}


const article_error = (error, article, dict) => {
console.log("ARTICLE_ERROR", article, dict)
console.log(error)
}



</script>

<style scoped>



button[disabled] {
color: theme('colors.gray.100');
cursor: default;
}

.announcement:focus-within .snackbar-search {
display: absolute !important;
bottom: 1rem;

}

</style>