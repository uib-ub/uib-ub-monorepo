<template>
    <main id="main" tabindex="-1">
    <div class="relative">
      <div class="flex justify-between">
         <div class="whitespace-nowrap pt-2">
            <NuxtLink class="pl-2" :to="`/${$i18n.locale}/${store.dict}/${advancedSpecialSymbols(store.q) ? '' : store.q}`"><Icon name="bi:arrow-left-short" size="1.5rem" class="mb-1 text-primary"/>{{$t('notifications.simple')}}</NuxtLink>
        </div>
    <h1 class="font-semibold pt-0 px-3 text-primary xl:text-xl !bg-tertiary-darken">{{$t('advanced')}}</h1>
       
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
