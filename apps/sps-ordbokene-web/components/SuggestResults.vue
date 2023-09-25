<template>
<section v-if="suggestions && suggestions.length" class="suggestions">
    <slot/>
    <ul class="nav nav-pills flex-column md:flex md:flex-wrap md:gap-2 pt-4 md:py-4">
        <template  v-for="(item, idx) in suggestions" :key="idx">
        <li class="!border-1 flex px-2 mx-0" v-if="minimal || !store.lemmas[dict].has(item.q)">
            <NuxtLink noPrefetch class="suggest-link py-3 md:py-0 w-full" :to="suggest_link(compare ? store.q + '|' + item : item)"><Icon :name="icon || 'bi:search'" class="mr-3 mb-1 text-primary"/><span class="link-content hoverlink">{{item}}</span></NuxtLink>
        </li>
        </template>
    </ul>
</section>
</template>

<script setup>

import { useSearchStore } from '~/stores/searchStore'
const store = useSearchStore()
const route = useRoute()

const props = defineProps({
    suggestions: Object,
    dict: String,
    minimal: Boolean,
    icon: String,
    compare: Boolean
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

    
    li:not(:last-child) {
        border-bottom: solid 1px theme('colors.gray.300')
    
    }
    
    @media screen(md) {
        li {
            border: none !important; 
        }
    }
    
    
    </style>