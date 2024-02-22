<template>
  <SanityContent :blocks="blocks" />
</template>

<script setup>
const props = defineProps({ blocks: { type: Array, required: true } });
</script>
