<template>
  <div>
    <Head>
      <Title> {{ $t("search.title") }} | {{ $t("index.title") }} </Title>
    </Head>
    <div class="flex">
      <SideBar />
      <div class="flex-1">
        <h1 class="sr-only">{{ $t("search.title") }}</h1>
        <SearchStatusBar />
        <div class="xl:flex">
          <SearchFilter />
          <main class="grow">
            <h2 id="main" class="pb-2 pt-3 text-2xl">
              <AppLink to="#main">
                {{ $t("searchFilter.results-heading") }}</AppLink
              >
            </h2>
            <ol
              v-if="searchData.length > 0"
              ref="scrollComponent"
              aria-labelledby="main"
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
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Matching, SearchOptions } from "../utils/vars";
import { FetchType } from "../composables/useFetchSearchData";

const route = useRoute();
const searchData = useSearchData();
const searchDataStats = useSearchDataStats();
const allowSearchFetch = useAllowSearchFetch();
const countFetchedMatches = computed(() => {
  return countSearchEntries(searchData.value);
});
const searchterm = useSearchterm();
const searchInterface = useSearchInterface();
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

      useFetchSearchData(
        useGenSearchOptions("further", {
          offset,
          matching: [Object.keys(offset)],
        })
      );
    }
  }
};

const searchScrollBarPos = useSearchScrollBarPos();
onBeforeUnmount(() => {
  searchScrollBarPos.value = window.pageYOffset;
});

function considerSearchFetching(situation: FetchType) {
  if (allowSearchFetch.value && searchInterface.value.term !== null) {
    searchData.value = [];
    useFetchSearchData(useGenSearchOptions(situation));
    allowSearchFetch.value = false;
  }
}

watch(
  () => searchInterface.value.term,
  () => {
    allowSearchFetch.value = true;
    umTrackEvent("Search: New term", {
      term: searchInterface.value.term as string,
    });
    considerSearchFetching("initial");
  }
);

watch(
  () => [
    searchInterface.value.domain,
    searchInterface.value.language,
    searchInterface.value.termbase,
    searchInterface.value.translate,
    searchInterface.value.domain,
  ],
  () => {
    if (allowSearchFetch.value !== null) {
      allowSearchFetch.value = true;
    }
    umTrackEvent("Search: Option change");
    considerSearchFetching("options");
    usePushSearchOptionsToRoute();
  },
  { deep: true }
);

onMounted(() => {
  considerSearchFetching("initial");

  /*
  Set searchOptions state based on route query values.

  Triggers only when searchTerm hasn't been set before
  i.e. when search route is visited directly
  */
  if (searchInterface.value.term === null) {
    for (const [key, value] of Object.entries(searchOptionsInfo)) {
      // Only set state if present in route
      // term can be empty string so the undefined check is neccessary
      if (route.query[value.q] !== undefined) {
        // searchterm needs be to added to searchbar field
        if (key === "term") {
          searchterm.value = route.query[value.q] as string;
        }

        // searchdomain needs to be handled differently because state is a list
        if (key === "domain") {
          const domene = route.query[value.q] as string;
          searchInterface.value.domain = JSON.parse(domene);
        }
        //
        else {
          searchInterface.value[key] = route.query[value.q] as string;
        }
      }
    }
  } else {
    // Push search options to route when navigating back
    usePushSearchOptionsToRoute();
  }
});
</script>
