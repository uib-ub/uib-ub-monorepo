<template>
  <AppLink v-if="to" class="underline hover:decoration-2" :to="to">
    {{ desc }}
  </AppLink>
  <span v-else>{{ desc }}</span>
</template>

<script setup lang="ts">
const props = defineProps({
  to: { type: String, default: null },
  desc: { type: String, required: true },
});
</script>
