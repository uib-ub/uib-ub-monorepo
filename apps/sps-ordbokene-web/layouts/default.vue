<template>
<div>
    <a class="bg-tertiary-darken1 text-center z-1000 text-anchor sr-only text-xl font-semibold underline w-full  !focus-within:p-10 focus:not-sr-only focus:absolute focus:min-w-screen" href="#main">Til innhold</a>
    <Header/>
  
    <nav :aria-label="$t('breadcrumbs')" class="ord-container justify-start mt-3 mb-2 flex !pl-2 gap-4 flex-wrap" v-if="!['welcome', 'index', 'search', 'article', 'word'].includes($route.name)">
        <NuxtLink v-if="store.searchUrl" :to="store.searchUrl"> <Icon name="bi:arrow-left" size="1.25em" class="mb-1 mr-1 text-primary"/>{{$t('notifications.back')}}</NuxtLink>
        <NuxtLink v-else :to="'/' + $i18n.locale"><Icon name="bi:arrow-left" size="1.25em" class="mb-1 mr-1 text-primary"/>{{$t('home')}}</NuxtLink>
        <NuxtLink v-if="$route.params.slug"  :to="$route.fullPath.slice(0, $route.fullPath.lastIndexOf('/'))"><Icon name="bi:arrow-left" size="1.25em" class="mb-1 mr-1 text-primary"/>{{$t($route.matched[0].children[1].name)}}</NuxtLink>
    </nav>
    <slot/>
    <Footer/>
</div>
</template>

<script setup> 
import { useSearchStore } from '~/stores/searchStore'
const store = useSearchStore()

</script>