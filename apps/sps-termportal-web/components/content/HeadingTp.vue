<template>
  <component :is="tag" :id="headingId" :class="headingClass">
    <slot />
  </component>
</template>

<script setup>
const props = defineProps({
  level: {
    type: String,
    required: true,
    validator: (value) => ["h1", "h2", "h3", "h4", "h5", "h6"].includes(value),
  },
  headingId: { type: String, default: undefined },
  headingClass: { type: String, default: "text-2xl" },
});

const tag = computed(() => {
  return props.level;
});
</script>
