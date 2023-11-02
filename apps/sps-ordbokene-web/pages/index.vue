<template>
<main id="main" tabindex="-1" class="flex flex-col grow-1 relative">
    <div class="">
      <h1 class="font-semibold !px-3 text-primary top-0 left-0 text-xl xl:text-2xl sr-only md:not-sr-only !absolute !bg-tertiary-darken">
        <span v-if="route.name=='word' || route.name == 'index' || route.name == 'welcome'">{{$t('simple')}}</span>
        <span v-if="route.name=='article'">{{$t('simple')}}</span>
      </h1>
    </div>

  <SearchNav v-if="route.name != 'search'"/>
    <NuxtErrorBoundary @error="form_error">
    <SearchForm v-if="route.name != 'search'" class="ord-container"/>
    <div v-if="route.name == 'article' && store.searchUrl" class="ord-container justify-start mt-2">
      <NuxtLink :to="store.searchUrl"> <Icon name="bi:arrow-left-short" size="1.5rem" class="mb-1 text-primary"/>{{$t('notifications.back')}}</NuxtLink>
    </div>
    <div v-else-if="route.name == 'article'" class="ord-container justify-start mt-2">
      <NuxtLink :to="`/${$i18n.locale}/`"> <Icon name="bi:arrow-left-short" size="1.5rem" class="mb-1 text-primary"/>{{$t('home')}}</NuxtLink>
    </div>
  </NuxtErrorBoundary>
    <div v-bind:class="{'md:pt-4': route.name != 'article', 'wallpaper': route.name == 'welcome' || route.name == 'index', 'ord-container': route.name != 'welcome' && route.name != 'index'}">
  <NuxtErrorBoundary @error="content_error">
    <NuxtPage/>
  </NuxtErrorBoundary>
    </div>
</main>
</template>

<script setup>
import { useSessionStore } from '~/stores/sessionStore'
import { useSearchStore } from '~/stores/searchStore'
const store = useSearchStore()
const session = useSessionStore()
const route = useRoute()

definePageMeta({
    middleware: [
      "simple-search-middleware"
    ]
  })

const form_error = (error) => {
  console.log("FORM ERROR",error)
}
const content_error = (error) => {
  console.log("CONTENT ERROR", error)
}

</script>

<style scoped>

h1 {
  font-variant: all-small-caps;
  letter-spacing: .1rem;
}
</style>
