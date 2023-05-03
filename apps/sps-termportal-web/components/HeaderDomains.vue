<template>
  <div>
    <div class="flex">
      <button
        class="mt-[2px] flex rounded px-2 align-top hover:bg-gray-200"
        type="button"
        @click="displaySubdomains = !displaySubdomains"
      >
        Domene:
        <!--
        <Icon
          v-if="!displaySubdomains"
          name="mdi:chevron-down"
          class="ml-[-4px] mr-[-8px]"
          aria-hidden="true"
        /><Icon
          v-else
          class="ml-[-4px] mr-[-8px]"
          name="mdi:chevron-up"
          aria-hidden="true"
        />
        -->
      </button>
      <ul class="flex">
        <HeaderDomain
          v-for="domain of ['all'].concat(Object.keys(domainNesting))"
          :key="domain"
          class="px-2"
          :tab-id="domain"
        />
      </ul>
    </div>

    <div class="relative flex max-w-screen-xl grow">
      <div
        v-if="displaySubdomains"
        class="absolute z-10 h-44 w-full grow border border-gray-300 bg-white p-2 font-semibold shadow-md"
      >
        Subdomener:
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const displaySubdomains = ref(false);
</script>
