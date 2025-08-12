<template>
  <div
    :id="`${tabId}Domains`"
    class="p-2"
    role="tabpanel"
    :aria-labelledby="`${tabId}Domains-tab`"
  >
    {{ searchInterface.domain[0] }}
  </div>
</template>

<script setup>
const searchInterface = useSearchInterface();

defineProps({
  tabId: { type: String, required: true },
});
</script>
