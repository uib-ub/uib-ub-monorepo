<template>
  <div class="flex flex-wrap gap-x-2">
    <span :id="`${target}DropdownLabel`" class="py-1">
      {{ $t(`searchBar.${target}`) }}:
    </span>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  target: { type: String, required: true },
});
</script>
