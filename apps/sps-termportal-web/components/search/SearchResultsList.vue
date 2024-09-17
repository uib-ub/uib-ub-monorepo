<template>
  <ol v-if="searchData.length > 0" ref="scrollComponent">
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
const searchInterface = useSearchInterface();
const searchData = useSearchData();
const searchDataStats = useSearchDataStats();
const searchDataPending = useSearchDataPending();

const props = defineProps({ context: { type: String, default: "full" } });

const scrollComponent = ref(null);

const pending = computed(() => {
  return !Object.values(searchDataPending.value).every((el) => !el);
});

const count = computed(() => {
  try {
    return sum(Object.values(searchDataStats.value?.context || [])) || 0;
  } catch (e) {
    return 0;
  }
});

const countFetchedMatches = computed(() => {
  return countSearchEntries(searchData.value);
});

onMounted(() => {
  window.addEventListener("scroll", fetchFurtherSearchData);
});
onUnmounted(() => {
  window.removeEventListener("scroll", fetchFurtherSearchData);
});

const fetchFurtherSearchData = () => {
  const element = scrollComponent.value;
  if (count.value > countFetchedMatches.value && !pending.value) {
    if (element.getBoundingClientRect().bottom * 0.75 < window.innerHeight) {
      const offset: SearchOptions["offset"] = {};

      if (searchInterface.value.term && searchInterface.value.term.length > 0) {
        let newOffsetCalc;
        let oldOffsetCalc = countFetchedMatches.value;
        let fetchNextMatching = false;

        for (const match of searchOptionsInfo.matching.default.flat()) {
          if (
            Object.keys(searchDataStats.value.matching || []).includes(match)
          ) {
            const matchCount =
              searchDataStats.value.matching?.[match as Matching] || 0;
            if (fetchNextMatching) {
              offset[match as Matching] = 0;
            }
            if (oldOffsetCalc < 0) {
              break;
            }
            newOffsetCalc = oldOffsetCalc - matchCount;
            if (newOffsetCalc < 0) {
              offset[match as Matching] = oldOffsetCalc;
            }
            const nextfetchCalc = matchCount - oldOffsetCalc;
            if (
              nextfetchCalc > 0 &&
              nextfetchCalc < searchOptionsInfo.limit.default
            ) {
              fetchNextMatching = true;
            }
            oldOffsetCalc = newOffsetCalc;
          }
        }
      } else {
        offset.all = countFetchedMatches.value;
      }

      console.log("fetch more");
      useFetchSearchData(
        useGenSearchOptions("further", {
          offset,
          matching: [Object.keys(offset)],
        })
      );
    }
  }
};
</script>
