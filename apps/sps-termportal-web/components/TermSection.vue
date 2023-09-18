<template>
  <dl class="grid" :class="{ 'gap-y-2': !flex, 'gap-y-0.5': flex }">
    <slot />
  </dl>
</template>
<script setup lang="ts">
const props = defineProps({
  flex: { type: Boolean, default: false },
});
</script>
