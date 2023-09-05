<template>
  <div>
    <!--Filter-->
    <div class="flex h-9 justify-between text-lg">
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
        <div class="xl:hidden">
          <Icon
            v-if="!showSearchFilter"
            name="mdi:chevron-down"
            class="ml-[-4px] mr-[-8px]"
            aria-hidden="true"
          /><Icon
            v-else
            class="ml-[-4px] mr-[-8px]"
            name="mdi:chevron-up"
            aria-hidden="true"
          />
        </div>
        <div class="hidden xl:block">
          <Icon
            v-if="!showSearchFilter"
            name="mdi:chevron-right"
            class="mr-[-8px]"
            aria-hidden="true"
          /><Icon
            v-else
            class="mr-[-8px]"
            name="mdi:chevron-left"
            aria-hidden="true"
          />
        </div>
      </button>
      <TransitionOpacity>
        <SpinnerIcon v-if="pending" />
      </TransitionOpacity>
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

/*
  watch([searchDataFiltered, searchDataPending], () => {
    if (!searchDataPending.value) {
      if (calcInitialState) {
        const data = await fetchData(genSearchQuery())
  
        //searchDataStats.value = calcStatsSearchData(
        //  searchDataFiltered.value,
        //  searchDataStats.value,
        //  calcInitialState
        //);
        calcInitialState = false;
      }
      searchDataStats.value = resetStats(searchDataStats.value, false);
      searchDataStats.value = calcStatsSearchData(
        searchDataFiltered.value,
        searchDataStats.value
      );
    }
  });
  */

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

/*
  function filterData(match: SearchDataEntry) {
    return Object.entries(searchFilterData.value).every(
      ([filter, filterValue]) => {
        if (!filterValue.length) {
          return true;
        } else {
          const matchValue = match[filter as keyof SearchFilterData];
          if (Array.isArray(matchValue)) {
            if (matchValue.every((v: string) => !filterValue.includes(v))) {
              return false;
            } else {
              return true;
            }
          } else {
            if (filterValue.includes(matchValue)) {
              return true;
            } else {
              return false;
            }
          }
        }
      }
    );
  }
  */

/*
  function calcStatsSearchData(
    data: SearchDataEntry[],
    stats: SearchDataStats,
    initialCalc?: boolean
  ) {
    const newStats = {
      lang: { ...stats.lang },
      samling: { ...stats.samling },
      predicate: { ...stats.predicate },
      matching: { ...stats.matching },
    };
  
    data.forEach((match) => {
      try {
        match.lang.forEach((l) => {
          const langFilter = searchFilterData.value?.lang;
          if (initialCalc || langFilter || langFilter.includes(l)) {
            newStats.lang[l] = newStats.lang[l] + 1 || 1;
          }
        });
        newStats.samling[match.samling] =
          newStats.samling[match.samling] + 1 || 1;
        newStats.predicate[match.predicate] =
          newStats.predicate[match.predicate] + 1 || 1;
        newStats.matching[match.matching] =
          newStats.matching[match.matching] + 1 || 1;
      } catch (e) {}
    });
    return newStats;
  }
  */
</script>
