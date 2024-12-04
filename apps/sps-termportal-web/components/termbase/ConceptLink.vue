<template>
  <AppLink :to="concept.link"
    ><span
      :lang="concept.language"
      class="hover:underline underline-offset-2"
      :class="{ 'text-gray-400': pending }"
      v-html="concept.label"
    ></span
  ></AppLink>
</template>

<script setup lang="ts">
const props = defineProps({
  concept: { type: Object, required: true },
  pending: { type: Boolean, default: false },
});
</script>
