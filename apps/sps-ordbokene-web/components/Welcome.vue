<template>
  <div class="flex justify-center">
    <div class="grid lg:grid-cols-2 py-3 h-full w-full md:w-auto gap-4" v-if="welcome_bm && welcome_nn">
      <section class="lg:col-auto lg:pr-2.5">
        <Article :article_id="parseInt(welcome_bm.front_article.value)" dict="bm" welcome />
      </section>
      <section class="lg:col-auto lg:pl-2.5">
        <Article :article_id="parseInt(welcome_nn.front_article.value)" dict="nn" welcome />
      </section>



      <div class="grid lg:grid-cols-1 py-3 h-full w-full bg-tertiary rounded">
        <h1 class="text-center text-primary  text-transform: uppercase text-sm font-bold tracking-widest">
          {{$t('article.update.bmo')}}</h1>
          <section v-for="([id, name], index) in editedArticlesbm" :key="index" class="lg:col-auto lg:pr-2.5 pt-2">
          <NuxtLink class="whitespace-nowrap hover:underline" :to="`/bm/${id}`">
            <p class="text-center text-lg text-text">{{ name }}</p>
          </NuxtLink>
        </section>
      </div>

      <div class="grid lg:grid-cols-1 py-3 h-auto w-auto bg-tertiary rounded">
        <h1 class="text-center text-primary  text-transform: uppercase text-sm font-bold tracking-widest">
          {{$t('article.update.nno', 1, { locale: content_locale})}}</h1>
        <section v-for="([id, name], index) in editedArticlesnn" :key="index" class="lg:col-auto lg:pr-2.5 pt-2">
          <NuxtLink class="whitespace-nowrap hover:underline" :to="`/nn/${id}`">
            <p class="text-center text-lg text-text">{{ name }}</p>
          </NuxtLink>
        </section>
      </div>


    </div>
    <Spinner v-else />
</div></template>




<script setup>
import { ref, onMounted } from 'vue'
import { useStore } from '~/stores/searchStore'

const store = useStore()

const editedArticlesbm = ref([])
const editedArticlesnn = ref([])

const fetchAndSortArticles = async (url, refContainer) => {
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    
    const data = await response.json()
    data.sort((a, b) => new Date(b[3]) - new Date(a[3]))
    refContainer.value = data.slice(0, 10)
  } catch (error) {
    console.error('Fetch Error:', error)
  }
}

onMounted(() => {
  fetchAndSortArticles(store.endpoint +'/bm/fil/article.json', editedArticlesbm) //Or:/bm/fil/article100.json
  fetchAndSortArticles(store.endpoint +'/nn/fil/article.json', editedArticlesnn)
})

const [{ bm_pending, data: welcome_bm }, { nn_pending, data: welcome_nn }] = await Promise.all([
  useLazyAsyncData('welcome_bm', () => $fetch(store.endpoint + '/bm/parameters.json')),
  useLazyAsyncData('welcome_nn', () => $fetch(store.endpoint + '/nn/parameters.json'))
])

</script>




<!-- <style scoped>


.monthly-title {
  font-size: 1.17em;
  @apply justify-center flex;
}

.monthly-title h2 {
  @apply text-white font-semibold text-xl bg-primary tracking-widest text-center rounded-[32px];
}

</style> -->
    