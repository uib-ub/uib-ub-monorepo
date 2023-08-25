<template>
<section v-if="suggestions && suggestions.length" class="suggestions py-4 px-2">
    <slot/>
    <ul class="nav nav-pills flex-column md:flex md:flex-wrap md:gap-8 pt-4 md:py-4">
        <template  v-for="(item, idx) in suggestions" :key="idx">
        <li class="nav-item flex" v-if="minimal || !store.lemmas[dict].has(item[0])">
            <NuxtLink noPrefetch class="suggest-link py-3 md:py-0 w-full" :to="suggest_link(item[0])"><Icon name="bi:search" class="mr-3 mb-1"/><span class="link-content">{{item[0]}}</span></NuxtLink>
        </li>
        </template>
    </ul>
</section>
</template>

<script setup>

import { useStore } from '~/stores/searchStore'
const store = useStore()
const route = useRoute()

const props = defineProps({
    suggestions: Object,
    dict: String,
    minimal: Boolean
})

const suggest_link = (suggestion) => {
    if (route.name == 'search') {
        let url = `search?q=${suggestion}&dict=${store.dict}&scope=${store.scope}`
        if (store.pos) {
            url = url + '&pos=' + store.pos
        }
        return url
    }
    else {
        return suggestion
    }
}


</script>

<style scoped>

a {
    font-size: 1.17rem;
    letter-spacing: .1rem;
    border: none;
    @apply md:p-2;
}

    .suggest-link:hover .link-content {
        @apply underline;
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