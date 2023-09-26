<template>
  <Dropdown
    :model-value="modelValue"
    :options="options"
    option-label="label"
    option-value="value"
    class="flex h-8 items-center justify-between"
    @change="$emit('update:modelValue', $event.value)"
  />
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: { type: String, required: true },
  options: { type: Array, required: true },
});

const emits = defineEmits(["update:modelValue"]);
</script>
