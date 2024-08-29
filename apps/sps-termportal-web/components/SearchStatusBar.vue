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
        <TransitionOpacity>
          <SpinnerIcon v-if="pending" />
        </TransitionOpacity>
      </div>
      <div class="flex">
        <div class="w-16 pr-1 text-right">{{ count }}</div>
        <div>{{ $t("searchFilter.results") }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const showSearchFilter = useShowSearchFilter();

const searchData = useSearchData();
const searchDataStats = useSearchDataStats();
const searchFilterData = useSearchFilterData();
const searchDataPending = useSearchDataPending();
const searchFetchInitial = useSearchFetchInitial();
const pending = computed(() => {
  return !Object.values(searchDataPending.value).every((el) => !el);
});
const count = computed(() => {
  if (searchDataPending.value.aggregate) {
    return countSearchEntries(searchData.value);
  }
  try {
    return sum(Object.values(searchDataStats.value?.lang || []));
  } catch (e) {
    return 0;
  }
});

watch(
  searchFilterData,
  () => {
    if (searchFetchInitial.value) {
      searchFetchInitial.value = false;
    } else {
      useFetchSearchData(useGenSearchOptions("filter"));
    }
  },
  { deep: true }
);
</script>
