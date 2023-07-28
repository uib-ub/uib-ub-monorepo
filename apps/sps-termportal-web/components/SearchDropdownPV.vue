<template>
  <Dropdown
    v-model="searchInterface[dropdown]"
    :options="options"
    optionLabel="label"
    optionValue="value"
    class="flex h-8 items-center justify-between"
  />
</template>

<script setup>
const searchInterface = useSearchInterface();
const props = defineProps({
  dropdown: { type: String, required: true },
  options: { type: Array, required: true },
});
</script>
