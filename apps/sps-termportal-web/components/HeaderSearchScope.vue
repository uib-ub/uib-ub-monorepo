<template>
  <div class="flex flex-wrap gap-y-1 py-0.5 md:flex-nowrap">
    <HeaderSearchDomains v-if="searchInterface.useDomain" />
    <HeaderSearchTermbases v-else :key="locale" />
  </div>
</template>

<script setup lang="ts">
const searchInterface = useSearchInterface();
const locale = useLocale();
</script>
