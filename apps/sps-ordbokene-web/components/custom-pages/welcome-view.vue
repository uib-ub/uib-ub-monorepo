<template>
  <div class="flex justify-center">
    <div class="grid lg:grid-cols-2 py-3 h-full w-full md:w-auto gap-4" v-if="welcome_bm && welcome_nn">
      <section class="lg:col-auto lg:pr-2.5">
        <Article :article_id="parseInt(welcome_bm.front_article.value)" dict="bm" :content_locale="content_locale('bm')" welcome />
      </section>
      <section class="lg:col-auto lg:pl-2.5">
        <Article :article_id="parseInt(welcome_nn.front_article.value)" dict="nn" :content_locale="content_locale('nn')" welcome />
      </section>

      <div>
      <section v-if="edited_bm" class="grid lg:grid-cols-1 py-3 h-full w-auto bg-tertiary rounded-[12px]">
        <h2>{{ $t('article.update.bmo', 1, {locale: content_locale}) }}</h2>
        <div v-for="([id, name], index) in edited_bm" :key="index" class="lg:col-auto lg:pr-2.5 pt-2">
          <NuxtLink class="whitespace-nowrap hover:underline" :to="`/${$i18n.locale}/bm/${id}`">
            <p >{{ name }}</p>
          </NuxtLink>
        </div>
      </section>
      </div>

      <div>
      <section v-if="edited_nn" class="grid lg:grid-cols-1 py-3 h-auto w-auto bg-tertiary rounded-[12px]">
        <h2>{{ $t('article.update.nno', 1, {locale: content_locale}) }}</h2>
        <div v-for="([id, name], index) in edited_nn" :key="index" class="lg:col-auto lg:pr-2.5 pt-2">
          <NuxtLink class="whitespace-nowrap hover:underline" :to="`/${$i18n.locale}/nn/${id}`">
            <p >{{ name }}</p>
          </NuxtLink>
        </div>
      </section>
      </div>

      <div>
      <section v-if="latest_bm" class="grid lg:grid-cols-1 py-3 h-auto w-auto bg-tertiary rounded-[12px]">
        <h2>{{ $t('article.added.bmo', 1, {locale: content_locale}) }}
        </h2>
        <div v-for="([id, name], index) in latest_bm" :key="index" class="lg:col-auto lg:pr-2.5 pt-2">
          <NuxtLink class="whitespace-nowrap hover:underline" :to="`/${$i18n.locale}/bm/${id}`">
            <p >{{ name }}</p>
          </NuxtLink>
        </div>
      </section>
      </div>
      
      <div>
      <section v-if="latest_nn" class="grid lg:grid-cols-1 py-3 h-auto w-auto bg-tertiary rounded-[12px]">
        <h2>{{ $t('article.added.nno', 1, {locale: content_locale}) }}</h2>
        <div v-for="([id, name], index) in latest_nn" :key="index" class="lg:col-auto lg:pr-2.5 pt-2">
          <NuxtLink class="whitespace-nowrap hover:underline" :to="`/${$i18n.locale}/nn/${id}`">
            <p >{{ name }}</p>
          </NuxtLink>
        </div>
      </section>
      </div>


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
  return {bm: 'nob', nn: 'nno'}[dict] || i18n.locale.value
}

const { data: welcome_bm} = useFetch(session.endpoint + 'bm/parameters.json')
const { data: welcome_nn} = useFetch(session.endpoint + 'nn/parameters.json')
const { data: edited_bm} = useLazyAsyncData('edited_bm', () => $fetch(session.endpoint +'/bm/fil/article.json').then(response => { return sortArticles(response) }))
const { data: edited_nn} = useLazyAsyncData('edited_nn', () => $fetch(session.endpoint +'/nn/fil/article.json').then(response => { return sortArticles(response) }))
const { data: latest_bm} = useLazyAsyncData('latest_bm', () => $fetch('https://ord.uib.no/bm/fil/article100new.json').then(response => { return sortArticles(response) }))
const { data: latest_nn} = useLazyAsyncData('latest_nn', () => $fetch('https://ord.uib.no/nn/fil/article100new.json').then(response => { return sortArticles(response) }))


</script>




 <style scoped>


.monthly-title {
  font-size: 1.17em;
  @apply justify-center flex;
}

.monthly-title h2 {
  @apply text-white font-semibold text-xl bg-primary tracking-widest text-center rounded-[32px];
}

h2 {
        font-family: Inria Serif;
        @apply text-center text-primary uppercase font-bold tracking-widest;
    }
p {
  font-family: Inria Serif;
  @apply text-center text-lg text-text;

}

</style>