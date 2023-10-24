<template>
  <div>
    <div class ="py-2 article-view">
      <NuxtErrorBoundary v-on:error="article_error($event, parseInt($route.params.article_id), dict)">
        <Article single :article_id="parseInt($route.params.article_id)" :dict="dict"/>
      </NuxtErrorBoundary>
    </div>
  </div>
</template>

<script setup>
import { useSearchStore } from '~/stores/searchStore'
const store = useSearchStore()
const route = useRoute()
const dict = route.params.dict // prevent reactivity that causes error message when navigating back to search

const article_error = (error, article_id, dict) => {
  useTrackEvent("article_error", {props: {article: dict + "/" + article, message: dict + "/" + article + " " + error.toString()}})
  console.log(error)
}


</script>

<style scoped>

.article {
    border-radius: 0;
}

</style>
