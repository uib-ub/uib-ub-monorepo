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
  margin-top: 0.25rem;
  }

.plain-list-indent {
  margin-left: 2em;
  margin-top: 0.55rem;
}
</style>
