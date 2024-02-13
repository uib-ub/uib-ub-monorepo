<template>
  <AppLink class="underline hover:decoration-2 underline-offset-2" :to="to">
    <slot />
  </AppLink>
</template>

<script setup lang="ts">
const props = defineProps({
  to: { type: String, required: true },
});
</script>
