<template>
<div>
<Welcome v-if="!$route.query.q"/>
</div>
</template>

<script setup>
definePageMeta({
    middleware: [
      function (to, from) { // Sync store with routing
      console.log("INTERCEPTED", to.)
        if (to.query.q) {
          return `/${to.params.dict}/${to.query.q}`
        }
      }
    ]
  })
</script>