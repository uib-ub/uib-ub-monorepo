<template>
  <li class="shrink-0 hover:bg-gray-200 rounded" role="presentation">
    <button
      :id="`${tabId}Domains-tab`"
      class="px-2 pt-1"
      :class="{ 'border-b-[2px] border-black': searchInterface.domain[0] == tabId }"
      :aria-current="searchInterface.domain[0] == tabId"
      type="button"
      role="tab"
      @click="searchInterface.domain = [tabId]"
    >
      {{ $t("global.domain." + tabId) }}
    </button>
  </li>
</template>

<script setup>
const searchInterface = useSearchInterface();

const props = defineProps({
  tabId: { type: String, required: true },
});
</script>
<style scoped></style>
