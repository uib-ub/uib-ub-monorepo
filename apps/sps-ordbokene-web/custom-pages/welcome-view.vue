<template>
<keep-alive>
<Welcome v-if="!$route.query.q"/>
</keep-alive>
</template>

<script setup>
definePageMeta({
    middleware: [
      function (to, from) { // Sync store with routing
        if (to.query.q) {
          return `/${to.params.dict}/${to.query.q}`
        }
      }
    ]
  })
</script>