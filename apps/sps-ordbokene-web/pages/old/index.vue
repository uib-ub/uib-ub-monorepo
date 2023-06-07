<script setup>
import { useI18n } from 'vue-i18n'
import { useStore } from '~/stores/searchStore'
const { t } = useI18n()
const store = useStore()

useHead({
  title: store.dict != 'bm,nn' ? t('dicts.'+store.dict) : "",
})

definePageMeta({
  middleware: ['endpoint-middleware']
})
</script>

<template>
  <Welcome v-if="store.concepts_bm && store.concepts_nn"/>

</template>
