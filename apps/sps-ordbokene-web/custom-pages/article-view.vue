<template>
  <div>
    <div class ="py-2 article-view">
        <Article single :article_id="parseInt($route.params.article_id)" :dict="dict"/>
    </div>
  </div>
</template>

<script setup>
import { useStore } from '~/stores/searchStore'
const store = useStore()
const route = useRoute()
const dict = route.params.dict
</script>

<style scoped>

.article {
    border-radius: 0;
}

</style>
