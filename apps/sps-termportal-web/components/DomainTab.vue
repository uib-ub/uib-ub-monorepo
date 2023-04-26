<template>
  <li class="shrink-0 hover:bg-gray-300" role="presentation">
    <button
      :id="`${tabId}Domains-tab`"
      class="rounded-t border border-b-0 border-gray-300 px-2 py-1 hover:bg-gray-300"
      :class="{ 'bg-gray-200': searchInterface.domain[0] == tabId }"
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
