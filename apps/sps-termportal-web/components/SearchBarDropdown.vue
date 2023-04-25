<template>
  <div class="flex flex-wrap gap-x-2">
    <label :for="`${dropdown}Select`" class="py-1">
      {{ $t("searchBar." + dropdown) }}:
    </label>
    <select
      :id="`${dropdown}Select`"
      v-model="searchInterface[dropdown]"
      class="tp-search-dd cursor-pointer p-1 pr-0 sm:h-9 sm:pl-2"
      :style="{ 'min-width': `${ddWidth}` }"
    >
      <slot></slot>
    </select>
  </div>
</template>

<script lang="ts" setup>
const searchInterface = useSearchInterface();
const props = defineProps({
  dropdown: { type: String, required: true },
  ddWidth: { type: String, required: false, default: "0px" },
});
</script>
