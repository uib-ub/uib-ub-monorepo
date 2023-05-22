<template>
    <div class ="py-2 article-view">
        <Article :article_id="parseInt($route.params.slug[0])" :dict="$route.params.dict"/>
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
