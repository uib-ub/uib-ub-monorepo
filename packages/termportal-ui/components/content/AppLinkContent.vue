<template>
  <AppLink class="underline hover:decoration-2" :to="to">
    {{ desc }}
  </AppLink>
</template>

<script setup lang="ts">
const props = defineProps({
  to: { type: String, required: true },
  desc: { type: String, required: true },
});
</script>
