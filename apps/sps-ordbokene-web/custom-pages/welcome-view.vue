<template>
<keep-alive>
<Welcome v-if="!$route.query.q"/>
</keep-alive>
</template>

<script setup>
import { useStore } from '~/stores/searchStore'

definePageMeta({
    middleware: [
      function (to, from) { // Sync store with routing
      const store = useStore()
        if (to.query.q) {
          if (specialSymbols(to.query.q)) {
            return `/search?q=${to.query.q}&dict=${to.params.dict}&scope=${store.scope}`
          }
          return `/${to.params.dict}/${to.query.q}`
        }
      }
    ]
  })
</script>