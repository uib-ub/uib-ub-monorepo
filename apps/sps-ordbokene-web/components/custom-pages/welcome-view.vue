<template>
<keep-alive>
<Welcome v-if="!$route.query.q"/>
</keep-alive>
</template>

<script setup>
import { useSearchStore } from '~/stores/searchStore'

definePageMeta({
    middleware: [
      function (to, from) { // Sync store with routing
      const store = useSearchStore()
      store.dict = to.params.dict || 'bm,nn'
        if (to.query.q) {
          if (advancedSpecialSymbols(to.query.q)) {
            return `/search?q=${to.query.q}&dict=${to.params.dict || 'bn,nn'}&scope=${store.scope}`
          }
          return `/${to.params.dict || 'bm,nn'}/${to.query.q}`
        }
      }
    ]
  })
</script>