<template>
  <component :is="tag" ref="headingRef" :class="headingClass">
    <AppLink :to="`#${elementId}`">
      <slot :use="$slots.default" unwrap="p" />
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
  font-size: 1.875rem;
  line-height: 2.25rem;
  padding-top: 1rem;
}

h2 {
  font-size: 1.5rem;
  line-height: 2rem;
  padding-bottom: 0.25rem;
}

h3 {
  font-weight: 600;
  padding-bottom: 0.25rem;
  padding-top: 1.5rem;
}
</style>
