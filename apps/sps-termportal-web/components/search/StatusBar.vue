<template>
  <div>
    <!-- Filter -->
    <div class="flex justify-between h-9 text-lg">
      <button
        class="flex h-full w-22 items-center justify-center rounded-[7px] border border-solid border-gray-300 tp-hover-focus"
        type="button"
        :title="
          showSearchFilter
            ? $t('searchFilter.filterTitleHide')
            : $t('searchFilter.filterTitleShow')
        "
        :aria-label="
          showSearchFilter
            ? $t('searchFilter.filterTitleHide')
            : $t('searchFilter.filterTitleShow')
        "
        @click="showSearchFilter = !showSearchFilter"
      >
        <span>{{ $t("searchFilter.filter") }}</span>
        <IconChevronDown
          v-if="!showSearchFilter"
          class="ml-1 mt-1 -mr-1"
        />
        <IconChevronUp
          v-else
          class="ml-1 mt-1 -mr-1"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const showSearchFilter = useShowSearchFilter();
</script>
