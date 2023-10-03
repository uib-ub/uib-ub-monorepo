<template>
  <div>
    <div class="grid lg:grid-cols-2 gap-4 grid-flow-row" v-if="welcome_bm && welcome_nn">

      <section class="grid">
        <Article :article_id="parseInt(welcome_bm.front_article.value)" dict="bm" :content_locale="content_locale()" welcome />
      </section>

      <section class="grid">
        <Article :article_id="parseInt(welcome_nn.front_article.value)" dict="nn" :content_locale="content_locale()" welcome />
      </section>

      <section v-if="edited_bm" class="welcome">
        <div class="article rounded !my-0  p-4">
          <h2 class="dict-label !text-xl">{{ $t('article.new', {dict: "Bokmålsordboka"}, {locale: content_locale('bm')}) }}</h2>
          <h3 class="px-5 pt-5 !text-xl">{{ $t('article.updated', 1, {locale: content_locale('bm')}) }}</h3>
          <ul class="flex flex-col md:flex-row flex-wrap px-4 py-2  gap-2">
            <li v-for="([id, name], index) in edited_bm" :key="index" class="lg:col-auto lg:pr-2.5 pt-2">
                <NuxtLink class="suggest-link" :to="`/${$i18n.locale}/bm/${id}`"><span class="hoverlink">{{name}}</span></NuxtLink>
            </li>
          </ul>

          <h3 class="px-5 !text-xl">{{ $t('article.added', 1, {locale: content_locale('bm')}) }}</h3>
          <ul class="flex flex-col md:flex-row flex-wrap px-4 py-2  gap-2">
            <li v-for="([id, name], index) in latest_bm" :key="index" class="lg:col-auto lg:pr-2.5 pt-2">
                <NuxtLink class="suggest-link" :to="`/${$i18n.locale}/bm/${id}`"><span class="hoverlink">{{name}}</span></NuxtLink>
            </li>
          </ul>
        </div>
      </section>

      <section v-if="edited_nn" class="welcome">
        <div class="article rounded !my-0  p-4">
          <h2 class="dict-label !text-xl">{{ $t('article.new', {dict: "Nynorskordboka"}, {locale: content_locale('nn')}) }}</h2>
          <h3 class="px-5 pt-5 !text-xl">{{ $t('article.updated', 1, {locale: content_locale('nn')}) }}</h3>
          <ul class="flex flex-col md:flex-row flex-wrap px-4 py-2  gap-2">
            <li v-for="([id, name], index) in edited_nn" :key="index" class="lg:col-auto lg:pr-2.5 pt-2">
                <NuxtLink class="suggest-link" :to="`/${$i18n.locale}/nn/${id}`"><span class="hoverlink">{{name}}</span></NuxtLink>
            </li>
          </ul>

          <h3 class="px-5 !text-xl">{{ $t('article.added', 1, {locale: content_locale('nn')}) }}</h3>
          <ul class="flex flex-col md:flex-row flex-wrap px-4 py-2  gap-2">
            <li v-for="([id, name], index) in latest_nn" :key="index" class="lg:col-auto lg:pr-2.5 pt-2">
                <NuxtLink class="suggest-link" :to="`/${$i18n.locale}/nn/${id}`"><span class="hoverlink">{{name}}</span></NuxtLink>
            </li>
          </ul>
        </div>
      </section>
    </div>
    <Spinner v-else />
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useSearchStore } from '~/stores/searchStore'
import { useSessionStore } from '~/stores/sessionStore'
const store = useSearchStore()
const session = useSessionStore()
const i18n = useI18n()

const sortArticles = async (data) => {
    return data.sort((a, b) => new Date(b[3]) - new Date(a[3])).slice(0, 5)
}

const content_locale = dict => {
  if (i18n.locale.value == "nob" || i18n.locale.value == 'nno') {
    return {bm: 'nob', nn: 'nno'}[dict] 
  }
  return i18n.locale.value
}

const { data: welcome_bm} = useFetch(session.endpoint + 'bm/parameters.json')
const { data: welcome_nn} = useFetch(session.endpoint + 'nn/parameters.json')
const { data: edited_bm} = useLazyAsyncData('edited_bm', () => $fetch(session.endpoint +'/bm/fil/article.json').then(response => { return sortArticles(response) }))
const { data: edited_nn} = useLazyAsyncData('edited_nn', () => $fetch(session.endpoint +'/nn/fil/article.json').then(response => { return sortArticles(response) }))
const { data: latest_bm} = useLazyAsyncData('latest_bm', () => $fetch('https://ord.uib.no/bm/fil/article100new.json').then(response => { return sortArticles(response) }))
const { data: latest_nn} = useLazyAsyncData('latest_nn', () => $fetch('https://ord.uib.no/nn/fil/article100new.json').then(response => { return sortArticles(response) }))


</script>




 <style scoped>
a {
    font-size: 1.17rem;
    letter-spacing: .1rem;
    border: 2px;
    @apply md:p-2;
}


</style>