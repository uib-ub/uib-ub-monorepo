<template>
  <ul class="plain-list" :class="indent ? 'plain-list-indent' : ''">
    <ContentSlot :use="$slots.default" unwrap="p ul" />
  </ul>
</template>

<script setup lang="ts">
const props = defineProps({
  indent: { type: Boolean, default: false },
});
</script>

<style>
.plain-list {
  @apply space-y-1;
}

.plain-list-indent {
  margin-left: 2em;
  @apply space-y-2;
}
</style>
