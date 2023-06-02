<template>
<div v-if="suggestions && suggestions.length" class="suggestions py-2 px-1 mb-4 mt-8">
    <h2><slot/></h2>
    <ul class="nav nav-pills flex-column md:flex md:flex-wrap md:gap-8 py-6 pt-4 md:py-8">
        <li class="nav-item flex" v-for="(item, idx) in suggestions" :key="idx">
            <NuxtLink class="suggest-link py-3 md:py-0 md w-full" :to="suggest_link(item[0])"><Icon name="bi:search" class="mr-3 mb-1"/><span class="link-content">{{item[0]}}</span></NuxtLink>
        </li>
    </ul>
</div>
</template>

<script setup>

import { useStore } from '~/stores/searchStore'
const store = useStore()
const route = useRoute()

const props = defineProps({
    suggestions: Object
})

const suggest_link = (suggestion) => {
    if (store.advanced) {
        let url = `search?q=${suggestion}&dict=${store.dict}&scope=${store.scope}`
        if (store.pos) {
            url = url + '&pos=' + store.pos
        }
        return url
    }
    else {
        let url = suggestion + "?orig=" + (route.query.orig || store.q)

        return url
    }
}


</script>

<style scoped>

a {
    font-size: 1.17rem;
    letter-spacing: .1rem;
    border: none;
}

.suggest-link:hover .link-content {
    border-bottom: solid 2px var(--link-decoration);
}

li:not(:last-child) {
    border-bottom: solid 1px theme('colors.gray.300')


}

@media screen(md) {
    li {
        border: none !important; 
    }
}


</style>
