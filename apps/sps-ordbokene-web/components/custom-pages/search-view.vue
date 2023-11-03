<template>
    <main id="main" tabindex="-1">
      <div class="flex">

    <h1 class="font-semibold !px-4 sm:!px-3 text-primary lg:top-0 lg:left-0 text-xl">
      {{$t('advanced')}} 
    </h1><div class="whitespace-nowrap pl-2 pt-[4px] text-base ml-auto mr-4 md:ml-0">
            <NuxtLink :to="`/${$i18n.locale}/${store.dict}/${advancedSpecialSymbols(store.q) ? '' : store.q}`"><Icon name="bi:arrow-left-short" size="1.5rem" class="mb-1 text-primary"/>{{$t('notifications.simple')}}</NuxtLink>
        </div>
      </div>

      <NuxtErrorBoundary @error="form_error">
        <AdvancedSearchForm class="ord-container"/>
      </NuxtErrorBoundary>
      <NuxtErrorBoundary @error="content_error">  
    <AdvancedResults v-if="store.q" class="ord-container mb-10"/>
      </NuxtErrorBoundary>
      <AdvancedHelp v-if="!store.q"/>
  </main>
</template>
  
<script setup>
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSearchStore } from '~/stores/searchStore'

const store = useSearchStore()
const route = useRoute()
const i18n = useI18n()

useHead({
title: i18n.t('advanced')
})

definePageMeta({
    middleware: ['advanced-search-middleware']
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
