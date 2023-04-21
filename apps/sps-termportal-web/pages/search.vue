<template>
  <div>
    <Head>
      <Title> {{ $t("search.title") }} | {{ $t("index.title") }} </Title>
    </Head>
    <h1 class="sr-only">{{ $t("search.title") }}</h1>
    <SearchFilter />
    <main>
      <h2 id="main" class="pb-2 pt-3 text-2xl">
        <AppLink to="#main"> {{ $t("searchFilter.results-heading") }}</AppLink>
      </h2>
      <ol
        v-if="searchData.length > 0"
        ref="scrollComponent"
        aria-labelledby="resultsheading"
      >
        <SearchResultListEntry
          v-for="entry in searchData"
          :key="entry.link + '_' + entry.label"
          :entry-data="entry"
        />
      </ol>
      <TransitionOpacity v-if="false" class="flex justify-center p-2">
        <SpinnerIcon v-if="pending && countFetchedMatches > 30" />
      </TransitionOpacity>
    </main>
  </div>
</template>

<script setup lang="ts">
import { Matching, MatchingNested } from "../utils/vars";
import { SearchOptions } from "../composables/states";
import { FetchType } from "../composables/useFetchSearchData";

const route = useRoute();
const searchData = useSearchData();
const searchFilterData = useSearchFilterData();
const searchDataStats = useSearchDataStats();
const allowSearchFetch = useAllowSearchFetch();
const countFetchedMatches = computed(() => {
  return countSearchEntries(searchData.value);
});
const searchterm = useSearchterm();
const searchOptions = useSearchOptions();
const count = computed(() => {
  try {
    return sum(Object.values(searchDataStats.value?.matching || [])) || 0;
  } catch (e) {
    return 0;
  }
});

const searchDataPending = useSearchDataPending();
const pending = computed(() => {
  return !Object.values(searchDataPending.value).every((el) => !el);
});

const scrollComponent = ref(null);

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
      const offset: SearchOptions["searchOffset"] = {};

      if (searchOptions.value.searchTerm.length > 0) {
        let newOffsetCalc;
        let oldOffsetCalc = countFetchedMatches.value;
        let fetchNextMatching = false;

        let searchMatching: Matching[] | MatchingNested[];
        if (typeof searchOptions.value.searchMatching === "string") {
          searchMatching = [searchOptions.value.searchMatching];
        } else {
          searchMatching = searchOptions.value.searchMatching;
        }

        for (const match of searchMatching.flat()) {
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
              nextfetchCalc < searchOptions.value.searchLimit
            ) {
              fetchNextMatching = true;
            }
            oldOffsetCalc = newOffsetCalc;
          }
        }
      } else {
        offset.all = countFetchedMatches.value;
      }

      const newOptions = {
        searchTerm: searchOptions.value.searchTerm,
        searchBase:
          searchFilterData.value.samling.length > 0
            ? searchFilterData.value.samling
            : searchOptions.value.searchBase,
        searchDomain: searchOptions.value.searchDomain,
        searchLanguage:
          searchFilterData.value.lang.length > 0
            ? searchFilterData.value.lang
            : searchOptions.value.searchLanguage,
        searchPredicate:
          searchFilterData.value.predicate.length > 0
            ? searchFilterData.value.predicate
            : searchOptions.value.searchPredicate,
        searchTranslate: searchOptions.value.searchTranslate,
        searchMatching:
          searchFilterData.value.matching.length > 0
            ? searchFilterData.value.matching
            : Object.keys(offset),
        searchLimit: searchOptions.value.searchLimit,
        searchOffset: offset,
      };
      useFetchSearchData(newOptions, "further", Object.keys(offset));
    }
  }
};

const searchScrollBarPos = useSearchScrollBarPos();
onBeforeUnmount(() => {
  searchScrollBarPos.value = window.pageYOffset;
});

function considerSearchFetching(situation: FetchType) {
  if (allowSearchFetch.value && searchOptions.value.searchTerm !== null) {
    searchData.value = [];
    useFetchSearchData(searchOptions.value, situation);
    allowSearchFetch.value = false;
  }
}

watch(
  () => searchOptions.value.searchTerm,
  () => {
    allowSearchFetch.value = true;
    considerSearchFetching("initial");
  }
);

watch(
  () => [
    searchOptions.value.searchDomain,
    searchOptions.value.searchLanguage,
    searchOptions.value.searchBase,
    searchOptions.value.searchTranslate,
  ],
  () => {
    allowSearchFetch.value = true;
    considerSearchFetching("options");
  }
);

considerSearchFetching("initial");

onMounted(() => {
  /*
  Set searchOptions state based on route query values.

  Triggers only when searchTerm hasn't been set before
  i.e. when search route is visited directly
  */
  if (searchOptions.value.searchTerm === null) {
    for (const [key, value] of Object.entries(searchOptionsInfo)) {
      // Only set state if present in route
      if (route.query[value.q]) {
        // searchterm needs be to added to searchbar field
        if (key === "searchTerm") {
          searchterm.value = route.query[value.q] as string;
        }

        // searchdomain needs to be handled differently because state is a list
        if (key === "searchDomain") {
          const domene = route.query[value.q] as string;
          searchOptions.value[key] = domene.split(",");
        }
        //
        else {
          searchOptions.value[key] = route.query[value.q] as string;
        }
      }
    }
  } else {
    // Push search options to route when navigating back
    usePushSearchOptionsToRoute();
  }
});
</script>
