<template>
  <SanityContent :blocks="blocks" />
</template>

<script setup>
defineProps({ blocks: { type: Array, required: true } });
</script>
