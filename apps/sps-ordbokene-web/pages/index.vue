<template></template>
<script setup>

const route = useRoute()
console.log("LOCALW", route.params.locale)

definePageMeta({
  middleware: 'welcome-dict'
})
</script>