<template>
  <div class="flex justify-center">
    <div class="grid lg:grid-cols-2 py-3 h-full w-full md:w-auto gap-4" v-if="welcome_bm && welcome_nn">
      <section class="lg:col-auto lg:pr-2.5">
        <Article :article_id="parseInt(welcome_bm.front_article.value)" dict="bm" welcome />
      </section>
      <section class="lg:col-auto lg:pl-2.5">
        <Article :article_id="parseInt(welcome_nn.front_article.value)" dict="nn" welcome />
      </section>



      <div v-if="edited_bm" class="grid lg:grid-cols-1 py-3 h-full w-auto bg-tertiary rounded-[12px]">
        <h1>{{ $t('article.update.bmo') }}</h1>
        <section v-for="([id, name], index) in edited_bm" :key="index" class="lg:col-auto lg:pr-2.5 pt-2">
          <NuxtLink class="whitespace-nowrap hover:underline" :to="`/bm/${id}`">
            <p >{{ name }}</p>
          </NuxtLink>
        </section>
      </div>

      <div v-if="edited_nn" class="grid lg:grid-cols-1 py-3 h-auto w-auto bg-tertiary rounded-[12px]">
        <h1>{{ $t('article.update.nno') }}</h1>
        <section v-for="([id, name], index) in edited_nn" :key="index" class="lg:col-auto lg:pr-2.5 pt-2">
          <NuxtLink class="whitespace-nowrap hover:underline" :to="`/nn/${id}`">
            <p >{{ name }}</p>
          </NuxtLink>
        </section>
      </div>

      <div v-if="latest_bm" class="grid lg:grid-cols-1 py-3 h-auto w-auto bg-tertiary rounded-[12px]">
        <h1>{{ $t('article.added.bmo') }}
        </h1>
        <section v-for="([id, name], index) in latest_bm" :key="index" class="lg:col-auto lg:pr-2.5 pt-2">
          <NuxtLink class="whitespace-nowrap hover:underline" :to="`/bm/${id}`">
            <p >{{ name }}</p>
          </NuxtLink>
        </section>
      </div>
      <div v-if="latest_nn" class="grid lg:grid-cols-1 py-3 h-auto w-auto bg-tertiary rounded-[12px]">
        <h1>{{ $t('article.added.nno') }}</h1>
        <section v-for="([id, name], index) in latest_nn" :key="index" class="lg:col-auto lg:pr-2.5 pt-2">
          <NuxtLink class="whitespace-nowrap hover:underline" :to="`/nn/${id}`">
            <p >{{ name }}</p>
          </NuxtLink>
        </section>
      </div>


    </div>
    <Spinner v-else />
  </div>
</template>




<script setup>
import { useSearchStore } from '~/stores/searchStore'
import { useSessionStore } from '~/stores/sessionStore'
const store = useSearchStore()
const session = useSessionStore()

const sortArticles = async (data) => {
    return data.sort((a, b) => new Date(b[3]) - new Date(a[3])).slice(0, 5)
}


const [{ data: welcome_bm} ,  
       { data: welcome_nn },
       { data: edited_bm },
       { data: edited_nn },
       { data: latest_bm },
       { data: latest_nn }
       ] = await Promise.all([
            useLazyAsyncData('welcome_bm', () => $fetch(session.endpoint + 'bm/parameters.json')),
            useLazyAsyncData('welcome_nn', () => $fetch(session.endpoint + '/nn/parameters.json')),
            useLazyAsyncData('edited_bm', () => $fetch(session.endpoint +'/bm/fil/article.json').then(response => { return sortArticles(response) })),
            useLazyAsyncData('edited_nn', () => $fetch(session.endpoint +'/nn/fil/article.json').then(response => { return sortArticles(response) })),
            useLazyAsyncData('latest_bm', () => $fetch('https://ord.uib.no/bm/fil/article100new.json').then(response => { return sortArticles(response) })),
            useLazyAsyncData('latest_nn', () => $fetch('https://ord.uib.no/nn/fil/article100new.json').then(response => { return sortArticles(response) }))
  ])


definePageMeta({
    middleware: [
      "simple-search"
    ]
  })

</script>




 <style scoped>


.monthly-title {
  font-size: 1.17em;
  @apply justify-center flex;
}

.monthly-title h2 {
  @apply text-white font-semibold text-xl bg-primary tracking-widest text-center rounded-[32px];
}

h1 {
        font-family: Inria Serif;
        @apply text-center text-primary uppercase text-sm font-bold tracking-widest;
    }
p{
  font-family: Inria Serif;
  @apply text-center text-lg text-text;

}

</style>