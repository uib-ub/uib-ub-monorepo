<template>
  <fieldset class="flex flex-col gap-y-1">
    <legend class="text-xl">{{ title }}</legend>
    <slot />
  </fieldset>
</template>

<script setup lang="ts">
const props = defineProps({
  title: { type: String, required: true },
});
</script>
