<template>
    <div v-bind:class="{'list': settings.listView}">     
    <Spinner v-if="pending"/>

    <div ref="results"  v-if="!pending && !error && articles && articles.meta" >
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
          <component v-for="(article_id, idx) in bm_articles" :key="article_id" :is="settings.listView ? 'li' : 'div'">
            <NuxtErrorBoundary v-on:error="article_error($event, article_id, 'bm')">
              <Article :article_id="article_id" dict="bm" :idx="idx" :list="settings.listView"/>
            </NuxtErrorBoundary>
          </component>
        </component>
      </section>
      <section class="lg:grid-cols-6" :aria-label="$t('dicts.nn')">
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
          <component v-for="(article_id, idx) in nn_articles" :key="article_id" :is="settings.listView ? 'li' : 'div'">
            <NuxtErrorBoundary v-on:error="article_error($event, article_id, 'nn')">
              <Article :article_id="article_id" dict="nn" :idx="idx" :list="settings.listView"/>
            </NuxtErrorBoundary>
          </component>
        </component>
      </section>
  </div>

    
    <div v-if="route.query.dict != 'bm,nn' ">
      <div v-if="route.query.dict == 'bm' && articles.meta.bm">
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
          <component v-for="(article_id, idx) in bm_articles" :key="article_id" :is="settings.listView ? 'li' : 'div'">
            <NuxtErrorBoundary v-on:error="article_error($event, article_id, 'bm')">
              <Article :article_id="article_id" dict="bm" :idx="idx" :list="settings.listView"/>
            </NuxtErrorBoundary>
          </component>
        </component>
      </div>
      <div v-if="(route.query.dict == 'nn' )  && articles.meta.nn">
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
          <component v-for="(article_id, idx) in nn_articles" :key="article_id" :is="settings.listView ? 'li' : 'div'">
            <NuxtErrorBoundary v-on:error="article_error($event, article_id, 'nn')">
              <Article :article_id="article_id" dict="nn" :idx="idx" :list="settings.listView"/>
            </NuxtErrorBoundary>
          </component>
        </component>
      </div>
      
    </div>
    <div v-if="pages > 1" class="p-2 py-6 md:p-8 flex md:flex-wrap justify-center flex md:gap-4">
    <button :disabled="page == 1" @click="change_page(-1)" class="bg-primary text-white rounded-4xl p-1 px-2 md:p-3 md:px-8">
      <Icon name="bi:chevron-left" class="md:mr-0.75em mb-0.125em"/><span class="sr-only md:not-sr-only">{{$t('previous-page') }}</span>
    </button>
    <div class="text-center self-center align-middle mx-4 md:mx-8 text-lg h-full">{{$t('pageof', {page, pages})}}</div>
    <button :disabled="page == pages" @click="change_page(1)" class="bg-primary text-white rounded-4xl p-1 px-2 md:p-3 md:px-8">
      <span class="sr-only md:not-sr-only">{{$t('next-page')}}</span><Icon name="bi:chevron-right" class="md:ml-0.75em mb-0.125em"/>
    </button>
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

const settings = useSettingsStore()
const store = useStore()
const route = useRoute()

const error_message = ref()
const per_page = 10
const page = ref(parseInt(route.query.page || "1"))
const pages = ref(0)
const offset = ref(per_page * page)
const results = ref()

const announcement = useState('announcement')

const bm_articles = ref([])
const nn_articles = ref([])


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



const slice_results = () => {
  offset.value = (page.value-1) * per_page
  if (articles.value.articles.bm) {
    let end_bm = offset.value < articles.value.articles.bm.length ? offset.value + per_page : articles.value.articles.bm.length
    bm_articles.value =  articles.value.articles.bm.slice(offset.value, end_bm)
  }
  if (articles.value.articles.nn) {
    let end_nn = offset.value < articles.value.articles.nn.length ? offset.value + per_page : articles.value.articles.nn.length
    nn_articles.value =  articles.value.articles.nn.slice(offset.value, end_nn)
  }


}


watch(() => route.query.page, () => {
page.value = route.query.page || 1
slice_results()
})

watch(articles, (newArticles) => {
  if (newArticles) {
    let total_bm = newArticles.meta.bm ? newArticles.meta.bm.total : 0
    let total_nn = newArticles.meta.nn ? newArticles.meta.nn.total : 0
    pages.value = Math.ceil(Math.max(total_bm, total_nn) / per_page)
    slice_results()
  }
}, {
deep: true,
immediate: true
}
)


const article_error = (error, article, dict) => {
console.log("ARTICLE_ERROR", article, dict)
console.log(error)
}

const change_page = async (change) => {
navigateTo({query: {...route.query, ...{page: parseInt(page.value || "1") + change}}})
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