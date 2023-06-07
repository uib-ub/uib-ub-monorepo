<template>
  <div>
    <NuxtLink v-if="store.searchUrl" class="border-none" :to="store.searchUrl"><Icon name="bi:arrow-left" size="1.25em" class="mb-1 mr-1 text-primary"/>{{$t('notifications.back')}}</NuxtLink>
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
