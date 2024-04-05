<template>
  <div :class="{ 'xs:flex': flex }">
    <dt class="max-w-prose font-semibold" :class="{ 'w-32 shrink-0': flex }">
      {{ label }}
    </dt>
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  label: { type: String, required: true },
  flex: { type: Boolean, default: false },
});
</script>