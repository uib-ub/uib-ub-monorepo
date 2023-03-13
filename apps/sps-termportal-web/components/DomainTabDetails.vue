<template>
  <div
    :id="`${tabId}Domains`"
    class="p-2"
    role="tabpanel"
    :aria-labelledby="`${tabId}Domains-tab`"
  >
    {{ searchOptions.searchDomain[0] }}
  </div>
</template>
<script setup>
const searchOptions = useSearchOptions();

const props = defineProps({
  tabId: { type: String, required: true },
});
</script>
