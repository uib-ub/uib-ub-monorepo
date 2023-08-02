<template>
    <div v-bind:class="{'list': listView}">     
    <Spinner v-if="pending"/>

    <div ref="results"  v-if="store.view != 'suggest' && !pending && !error && articles && articles.meta" >
    <div tabindex="0" aria-live="polite" role="status" ref="announcement" class="announcement lg:sr-only pb-2 pl-1 text-gray-900 text-md" v-bind:class="{'sr-only': !store.advanced}">
    <span v-if="articles.meta.bm"><div></div>{{$t('notifications.results', {count: articles.meta.bm.total})+$t("in")+$t('dicts_inline.bm')}}</span>
    <span v-if="articles.meta.nn && articles.meta.bm"> | </span>
    <span v-if="articles.meta.nn">{{$t('notifications.results', {count: articles.meta.nn.total})+$t("in")+$t('dicts_inline.nn')}}</span>
    <div class="sr-only" v-if="listView"> Søkeresultatene ligger i en liste med lenker du kan nå med tabulatortasten.</div>
    <div class="sr-only" v-else> Søkeresultatene ligger nå i et hierarki av overskrifter du ikke kan nå med tabulatortasten.</div>
    
    <div class="hidden snackbar-search">Trykk Shift + 7 for å gå til søkefeltet</div>
    </div>


    <div class="gap-3 lg:gap-8 grid lg:grid-cols-2" v-if="route.query.dict == 'bm,nn' ">
      <section class="lg:grid-cols-6" :aria-label="$t('dicts.bm')">
        <div class="hidden lg:inline-block py-2 px-1"><h2 class="lg:inline-block">Bokmålsordboka</h2>
          <span><span v-if="(articles.meta.bm.total > 1)" aria-hidden="true" class="result-count">  | {{$t('notifications.results', {count: articles.meta.bm.total})}}</span>
          <span v-else-if="articles.meta.bm.total == 0" aria-hidden="true" class="result-count">  | {{$t('notifications.no_results')}}</span></span></div>
          <div v-if="listView" class="inline-block lg:hidden"><h2>Bokmålsordboka</h2></div>
        <component :is="listView ? 'ol' : 'div'" class="article-column">
          <component v-for="(article_id, idx) in bm_articles" :key="article_id" :is="listView ? 'li' : 'div'">
            <NuxtErrorBoundary v-on:error="article_error($event, article_id, 'bm')">
              <Article :article_id="article_id" dict="bm" :idx="idx"/>
            </NuxtErrorBoundary>
          </component>
        </component>
      </section>
      <section class="lg:grid-cols-6" :aria-label="$t('dicts.nn')">
        <div class="hidden lg:inline-block py-2 px-1"><h2 class="lg:inline-block">Nynorskordboka</h2>
          <span><span v-if="articles.meta.nn.total>1" aria-hidden="true" class="result-count">  | {{$t('notifications.results', {count: articles.meta.nn.total})}}</span>
          <span v-else-if="articles.meta.nn.total == 0" aria-hidden="true" class="result-count">  | {{$t('notifications.no_results')}}</span></span></div>
          <div  v-if="listView" class="inline-block lg:hidden"><h2>Nynorskordboka</h2></div>
        <component class="article-column" :is="listView ? 'ol' : 'div'">
          <component v-for="(article_id, idx) in nn_articles" :key="article_id" :is="listView ? 'li' : 'div'">
            <NuxtErrorBoundary v-on:error="article_error($event, article_id, 'nn')">
              <Article :article_id="article_id" dict="nn" :idx="idx"/>
            </NuxtErrorBoundary>
          </component>
        </component>
      </section>
  </div>

    
    <div v-if="route.query.dict != 'bm,nn' ">
      <div v-if="route.query.dict == 'bm' && articles.meta.bm">
        <div class="hidden lg:inline-block py-2 px-1"><h2 class="lg:inline-block">Bokmålsordboka</h2>
          <span v-if="(articles.meta.bm.total>1)" class="result-count">  | {{$t('notifications.results', {count: articles.meta.bm.total})}}</span>
        </div>
        <component class="article-column" :is="listView ? 'ol' : 'div'">
          <component v-for="(article_id, idx) in bm_articles" :key="article_id" :is="listView ? 'li' : 'div'">
            <NuxtErrorBoundary v-on:error="article_error($event, article_id, 'bm')">
              <Article :article_id="article_id" dict="bm" :idx="idx"/>
            </NuxtErrorBoundary>
          </component>
        </component>
      </div>
      <div v-if="(route.query.dict == 'nn' )  && articles.meta.nn">
        <div class="hidden lg:inline-block py-2 px-1"><h2 class="lg:inline-block">Nynorskordboka</h2>
          <span v-if="(articles.meta.nn.total>1)" class="result-count">  | {{$t('notifications.results', {count: articles.meta.nn.total})}}</span>
        </div>
        <component class="article-column" :is="listView ? 'ol' : 'div'">
          <component v-for="(article_id, idx) in nn_articles" :key="article_id" :is="listView ? 'li' : 'div'">
            <NuxtErrorBoundary v-on:error="article_error($event, article_id, 'nn')">
              <Article :article_id="article_id" dict="nn" :idx="idx"/>
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
  <client-only>
    <div class="my-10">
  <SuggestResults v-if="!pending && suggestions.similar" :suggestions="suggestions.similar">{{$t('notifications.similar')}}</SuggestResults>
    </div>
  </client-only>


</div>


</template>

<script setup>

import { useStore } from '~/stores/searchStore'
import {useSettingsStore } from '~/stores/settingsStore'

const settings = useSettingsStore()
const store = useStore()
const route = useRoute()

const suggestions = ref({similar: []})
const error_message = ref()
const per_page = 10
const page = ref(parseInt(route.query.page || "1"))
const pages = ref(0)
const offset = ref(per_page * page)
const results = ref()

const announcement = useState('announcement')

const bm_articles = ref([])
const nn_articles = ref([])

const listView = computed(() => {
  return store.q && store.view != "article" &&  settings.listView && route.name == 'search'
})


const get_suggestions = async () => {
  if (process.client && !specialSymbols(store.q)) {
  const response = await $fetch(`${store.endpoint}api/suggest?&q=${route.query.q}&dict=${route.query.dict}${route.query.pos ? '&pos=' + route.query.pos : ''}&n=10&dform=int&meta=n&include=es`)                                
  suggestions.value = filterSuggestions(response, store.q, store.q)
  }
  else {
    suggestions.value = {similar: []}
  } 
}
const { pending, error, refresh, data: articles } = await useFetch(() => `api/articles?w=${route.query.q}&dict=${route.query.dict}&scope=${route.query.scope}&wc=${route.query.pos||''}`, {
          baseURL: store.endpoint,
          onResponseError(conf) {
            console.log("RESPONSE ERROR")
          },
          onResponse({ request, options, response }) {
            get_suggestions()
          },
        })



const slice_results = () => {
  offset.value = (page.value-1) * per_page
  if (articles.value.articles.bm) {
    let end_bm = offset.value < articles.value.articles.bm.length ? offset.value + per_page : articles.value.articles.bm.length
    console.log(offset.value, end_bm)
    bm_articles.value =  articles.value.articles.bm.slice(offset.value, end_bm)
  }
  if (articles.value.articles.nn) {
    let end_nn = offset.value < articles.value.articles.nn.length ? offset.value + per_page : articles.value.articles.nn.length
    console.log(offset.value, end_nn)
    nn_articles.value =  articles.value.articles.nn.slice(offset.value, end_nn)
  }

  console.log(nn_articles.value)

}


onMounted(() => {
    get_suggestions()    
})

  watch(() => route.query.page, () => {
  page.value = route.query.page || 1
  slice_results()
})

watch(articles, (newArticles) => {
  if (newArticles) {
    let total_bm = newArticles.meta.bm ? newArticles.meta.bm.total : 0
    let total_nn = newArticles.meta.nn ? newArticles.meta.nn.total : 0
    console.log(Math.max(total_bm, total_nn))
    pages.value = Math.ceil(Math.max(total_bm, total_nn) / per_page)
    if (total_bm + total_nn == 0) get_suggestions()
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



button[disabled] {
  color: theme('colors.gray.100');
  cursor: default;
}

.announcement:focus-within .snackbar-search {
  display: absolute !important;
  bottom: 1rem;

}

</style>