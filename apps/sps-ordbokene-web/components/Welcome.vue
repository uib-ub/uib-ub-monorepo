<script setup>
import { useStore } from '~/stores/searchStore'
const store = useStore()


const [{ bm_pending, data: welcome_bm },  { nn_pending, data: welcome_nn }] = await Promise.all([
    useLazyAsyncData('welcome_bm', () => $fetch(store.endpoint + 'bm/parameters.json')),
    useLazyAsyncData('welcome_nn', () => $fetch(store.endpoint + '/nn/parameters.json'))
  ])

</script>

<template>
  <div class="flex justify-center">
  <div class="grid lg:grid-cols-2 py-3 h-full w-full md:w-auto gap-4" v-if="welcome_bm && welcome_nn">
      <section class="lg:col-auto lg:pr-2.5">
      <Article :article_id="parseInt(welcome_bm.front_article.value)" dict="bm" welcome/>
      </section>
      <section class="lg:col-auto lg:pl-2.5">
      <Article :article_id="parseInt(welcome_nn.front_article.value)" dict="nn" welcome/>
      </section>
              
  </div> 
    <Spinner v-else/>
  </div> 
</template>

<style scoped>


.monthly-title {
  font-size: 1.17em;
  @apply justify-center flex;
}

.monthly-title h2 {
  /* border-radius: 2rem; */
  /* letter-spacing: .1rem; */
  @apply text-white font-semibold text-xl bg-primary tracking-widest text-center rounded-[32px];
}

</style>
    