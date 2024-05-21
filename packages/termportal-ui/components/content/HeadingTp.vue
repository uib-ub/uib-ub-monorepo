<template>
  <component :is="tag" ref="headingRef" :class="headingClass">
    <AppLink :to="`#${elementId}`">
      <ContentSlot :use="$slots.default" unwrap="p" />
    </AppLink>
  </component>
</template>

<script setup lang="ts">
const headingRef = ref();
const elementId = ref("");

const props = defineProps({
  level: {
    type: String,
    required: true,
    validator: (value: string) =>
      ["h1", "h2", "h3", "h4", "h5", "h6"].includes(value),
  },
  headingId: { type: String, default: undefined },
  headingClass: { type: String, default: undefined },
});

const tag = computed(() => {
  return props.level;
});

onMounted(() => {
  if (props.headingId) {
    elementId.value = props.headingId;
  } else {
    const headingText = headingRef.value.innerText;
    elementId.value = headingText.toLowerCase().replace(/\s+/g, "-");
  }
  headingRef.value.id = elementId.value;
});
</script>

<style scoped>
h1 {
  @apply text-3xl pt-4;
}

h2 {
  @apply text-2xl pb-1;
}

h3 {
  @apply font-semibold pb-1 pt-6;
}
</style>
