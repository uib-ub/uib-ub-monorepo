<template>
  <div class="flex flex-wrap gap-y-1 py-0.5 md:flex-nowrap">
    <div class="pr-2">
      <button
        class="tp-hover-focus flex h-9 items-center border-gray-300 px-1.5 pb-1 pt-0.5"
        @click="searchInterface.useDomain = !searchInterface.useDomain"
      >
        <div class="min-w-[5rem]">
          <span v-if="searchInterface.useDomain">{{
            $t("global.domain.domain", 0)
          }}</span>
          <span v-else>{{ $t("global.termbase", 0) }}</span>
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
    </div>
    <HeaderSearchDomains v-if="searchInterface.useDomain" />
    <HeaderSearchTermbases v-else />
  </div>
</template>

<script setup lang="ts">
const searchInterface = useSearchInterface();
</script>
