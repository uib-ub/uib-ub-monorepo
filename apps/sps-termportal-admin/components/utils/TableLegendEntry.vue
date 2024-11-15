<template>
  <div class="flex space-x-2">
    <dt class="font-semibold" :class="`w-${legendWidth}`">
      {{ legendKey }}
    </dt>
    <dd>{{ legendValue }}</dd>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  legendKey: { type: String, required: true },
  legendValue: { type: String, required: true },
  legendWidth: { type: String, default: "48" },
});
</script>
