<template>
  <div class="flex space-x-2">
    <dt
      class="font-semibold"
      :class="`w-${legendWidth}`"
    >
      {{ legendKey }}
    </dt>
    <dd>{{ legendValue }}</dd>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  legendKey: string | number;
  legendValue: string;
  legendWidth?: string | number;
}>(), {
  legendWidth: "48",
});
</script>
