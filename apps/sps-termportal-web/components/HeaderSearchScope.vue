<template>
  <div class="flex py-0.5">
    <button
      class="tp-hover-focus flex items-end border-gray-300 px-1.5 pb-1 pt-0.5 h-8"
      @click="searchInterface.useDomain = !searchInterface.useDomain"
    >
      <div class="min-w-[5rem]">
        <span v-if="searchInterface.useDomain">Domains</span>
        <span v-else>Termbases</span>
      </div>

      <div class="pb-[0.5px]">
        <Icon
          name="uil:arrow"
          rotate="45"
          aria-hidden="true"
          class="text-gray-500"
        />
      </div>
    </button>
    <HeaderSearchDomains v-if="searchInterface.useDomain" />
    <HeaderSearchTermbases v-else />
  </div>
</template>

<script setup lang="ts">
const searchInterface = useSearchInterface();
</script>
