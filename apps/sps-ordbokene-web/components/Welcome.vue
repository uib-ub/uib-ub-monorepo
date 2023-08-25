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
  display: flex;
  justify-content: center;
}

.monthly-title h2 {
  @apply bg-primary;

  border-radius: 2rem;
  text-align: center;
  letter-spacing: .1rem;
  font-size: 1.25rem;
  font-weight: 600;
  @apply text-white;
}

</style>
    