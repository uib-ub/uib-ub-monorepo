<template>
    <div class="callout error lg:p-4">
    <h2><Icon name="bi:exclamation-triangle-fill" class="mr-3 mb-1"/>{{title}}</h2>
    <p>Feil feil feil!</p>{{error}}
  </div>

</template>

<script setup>

const props = defineProps({
    error: Object
})

console.log("type", typeof props.error)

const title = "Feil"

</script>