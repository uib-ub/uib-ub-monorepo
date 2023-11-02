<template>
<div>
    <div class="p-4 py-10 sr-only focus-within:not-sr-only absolute">
        <a class="bg-tertiary-darken1 text-center z-1000 text-anchor text-xl font-semibold underline w-full  focus:absolute focus:min-w-screen" href="#main">
            {{$t('accessibility.main_content')}}
        </a>
    </div>
    <div class="p-4 py-10 sr-only focus-within:not-sr-only absolute">
        <NuxtLink class="bg-tertiary-darken1 text-center z-1000 text-anchor text-xl font-semibold underline w-full  focus:absolute focus:min-w-screen" :to="`/${$i18n.locale}/help/accessibility`">
            {{$t('accessibility.page')}}
        </NuxtLink>
    </div>
    <Header/>

    <nav :aria-label="$t('breadcrumbs')" class=" justify-start mt-2 mb-2 flex !pl-2 gap-4 flex-wrap" v-if="!['welcome', 'index', 'search', 'article', 'word'].includes($route.name)">
        <NuxtLink v-if="store.searchUrl" :to="store.searchUrl"><Icon name="bi:arrow-left-short" size="1.5rem" class="mb-1 text-primary"/>{{$t('notifications.back')}}
        </NuxtLink>
        <NuxtLink v-else :to="'/' + $i18n.locale">
            <Icon name="bi:arrow-left-short" size="1.5rem" class="mb-1 text-primary"/>{{$t('home')}}
        </NuxtLink>
        <NuxtLink v-if="$route.params.slug"  :to="$route.fullPath.slice(0, $route.fullPath.lastIndexOf('/'))">
            <Icon name="bi:arrow-left-short" size="1.5rem" class="mb-1 text-primary"/>{{$t($route.matched[0].children[1].name)}}
        </NuxtLink>
    </nav>
    <slot/>
    <Footer/>
</div>
</template>

<script setup> 
import { useSearchStore } from '~/stores/searchStore'
const store = useSearchStore()

</script>