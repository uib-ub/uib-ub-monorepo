<template>
  <div>
    <div class ="py-2 article-view">
        <Article single :article_id="parseInt($route.params.article_id)" :dict="$route.params.dict"/>
    </div>
  </div>
</template>

<script setup>
import { useStore } from '~/stores/searchStore'
const store = useStore()
</script>


<style scoped>

.article {
    border-radius: 0;
}

</style>
