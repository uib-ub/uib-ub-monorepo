<template>
  <div>
    <!--Filter-->
    <div class="flex h-9 justify-between text-lg">
      <div class="flex gap-x-4 items-center">
        <button
          class="flex h-full w-24 items-center justify-center rounded-[7px] border border-solid border-gray-300 tp-hover-focus"
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
          <div class="">
            <Icon
              v-if="!showSearchFilter"
              name="mdi:chevron-down"
              class="ml-1 mr-[-8px]"
              aria-hidden="true"
            /><Icon
              v-else
              class="ml-1 mr-[-8px]"
              name="mdi:chevron-up"
              aria-hidden="true"
            />
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const showSearchFilter = useShowSearchFilter();
</script>
