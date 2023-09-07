<template>
  <div class="flex flex-wrap gap-x-2">
    <label :for="`${target}Dropdown`" class="py-1">
      {{ $t(`searchBar.${target}`) }}:
    </label>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  target: { type: String, required: true },
});
</script>
