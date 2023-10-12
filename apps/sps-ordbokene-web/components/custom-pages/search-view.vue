<template>
    <main id="main" tabindex="-1">
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
