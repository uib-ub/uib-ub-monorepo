<template>
  <div>
    <div class ="py-2 article-view">
        <Article single :article_id="parseInt($route.params.article_id)" :dict="dict"/>
    </div>
  </div>
</template>

<script setup>
import { useSearchStore } from '~/stores/searchStore'
const store = useSearchStore()
const route = useRoute()
const dict = route.params.dict // prevent reactivity that causes error message when navigating back to search
</script>

<style scoped>

.article {
    border-radius: 0;
}

</style>
