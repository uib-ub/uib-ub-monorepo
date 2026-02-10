<template>
  <ol ref="resultslist">
    <template v-if="context === 'full'">
      <SearchResultListEntry
        v-for="entry in searchData"
        :key="entry.label + entry.link + entry.lang"
        :entry-data="entry"
      />
    </template>
    <template v-else>
      <SearchResultListEntryShort
        v-for="entry in searchData"
        :key="entry.label + entry.link + entry.lang"
        :entry-data="entry"
      />
    </template>
  </ol>
</template>

<script setup lang="ts">
const appConfig = useAppConfig();

const searchOptionsConfig = appConfig.search.options;
const searchInterface = useSearchInterface();
const searchData = useSearchData();
const searchDataStats = useSearchDataStats();
const searchDataPending = useSearchDataPending();

defineProps({
  context: { type: String, default: "full" },
});

const resultslist = ref(null);

const pending = computed(() => {
  return !Object.values(searchDataPending.value).every(el => !el);
});

const totalMatchesCount = computed(() => {
  try {
    return sum(Object.values(searchDataStats.value?.matching || [])) || 0;
  }
  catch (e) {
    return 0;
  }
});

const fetchedMatchesCount = computed(() => {
  return countSearchEntries(searchData.value);
});

onMounted(() => {
  // if (props.context === "full") {
  window.addEventListener("scroll", fetchFurtherSearchData);
  // }
});
onUnmounted(() => {
  // if (props.context === "full") {
  window.removeEventListener("scroll", fetchFurtherSearchData);
  // }
});

const flatMatchingValues = appConfig.search.options.matching.default.flat() as Matching[];
const fetchFurtherSearchData = () => {
  const element = resultslist.value;
  if (totalMatchesCount.value > fetchedMatchesCount.value && !pending.value) {
    if (element && element.getBoundingClientRect().bottom * 0.75 < window.innerHeight) {
      const offset: SearchOptions["offset"] = {};

      if (searchInterface.value.term && searchInterface.value.term.length > 0) {
        let offsetCalc: number = fetchedMatchesCount.value;

        for (const matchingPattern of flatMatchingValues) {
          if (matchingPattern === "full-ci" && searchDataStats.value?.matching?.["full"]) {
            offsetCalc = offsetCalc - searchDataStats.value?.matching?.["full"];
          }
          // Continue if matchingPattern not is part of the matched patterns for the current search string
          // Edge case: doesn't match the "full" pattern,
          // because the actual patterns are "full-cs" and "full-ci" and the data in `searchDataStats` is "full"
          // There are usually not more than 50 "full" matches
          if (!searchDataStats.value.matching?.[matchingPattern]) continue;
          if (offsetCalc < searchDataStats.value.matching?.[matchingPattern]) {
            offset[matchingPattern] = offsetCalc;
          }
          offsetCalc = offsetCalc - searchDataStats.value?.matching?.[matchingPattern];
          // Don't check additional patterns if there are remaining matches for the current pattern
          if (offsetCalc < 0) break;
        }
      }
      else {
        offset.all = fetchedMatchesCount.value;
      }
      useFetchSearchData(
        useGenSearchOptions("further", {
          offset,
          matching: [Object.keys(offset)],
        }),
      );
    }
  }
};
</script>
