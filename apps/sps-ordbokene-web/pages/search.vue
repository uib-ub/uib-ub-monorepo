<template>
    <main id="main" tabindex="-1" class="dict-view">
      <NuxtErrorBoundary @error="form_error">
        <AdvancedSearchForm class="ord-container"/>
      </NuxtErrorBoundary>
      <NuxtErrorBoundary @error="content_error">  
    <AdvancedResults v-if="store.q" class="ord-container mb-10"/>
      </NuxtErrorBoundary>


  </main>
</template>
  
<script setup>
import { useStore } from '~/stores/searchStore'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const store = useStore()
const route = useRoute()

useHead({
title: t('advanced.title')
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
