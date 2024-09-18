<template>
  <div>
    <Head>
      <Title> {{ $t("search.title") }} | {{ $t("index.title") }} </Title>
    </Head>
    <div class="flex">
      <h1 class="hidden">{{ $t("search.title") }}</h1>
      <SideBar>
        <SearchFilter class="hidden xl:block" placement="sidebar" />
      </SideBar>
      <div class="flex-1 max-w-7xl">
        <section>
          <SearchStatusBar />
        </section>
        <div class="xl:flex">
          <SearchFilter class="block xl:hidden" placement="main" />
          <main class="grow">
            <h2 id="main" class="pb-2 pt-3 text-2xl">
              <AppLink to="#main">
                {{ $t("searchFilter.results-heading") }}</AppLink
              >
            </h2>
            <SearchResultsList />
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
import { uiConfig } from "../utils/vars";
import { FetchType } from "../composables/useFetchSearchData";

const route = useRoute();
const searchData = useSearchData();
const allowSearchFetch = useAllowSearchFetch();
const showSearchFilter = useShowSearchFilter();
const breakpoint = useBreakpoint();
const countFetchedMatches = computed(() => {
  return countSearchEntries(searchData.value);
});
const searchterm = useSearchterm();
const searchInterface = useSearchInterface();

const searchDataPending = useSearchDataPending();
const pending = computed(() => {
  return !Object.values(searchDataPending.value).every((el) => !el);
});

const searchScrollBarPos = useSearchScrollBarPos();
onBeforeUnmount(() => {
  searchScrollBarPos.value = window.scrollY;
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
    /*
    umTrackEvent("Search: New term", {
      term: searchInterface.value.term as string,
    });
    */
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
    searchInterface.value.useDomain,
  ],
  () => {
    if (allowSearchFetch.value !== null) {
      allowSearchFetch.value = true;
    }
    // umTrackEvent("Search: Option change");
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
    // display filter if screen size larger than lg
    if (uiConfig.wideUiBreakpoints.includes(breakpoint.value)) {
      showSearchFilter.value = true;
    }

    for (const [key, value] of Object.entries(searchOptionsInfo)) {
      // Only set state if present in route
      // term can be empty string so the undefined check is neccessary
      if (route.query[value.q] !== undefined) {
        // searchterm needs be to added to searchbar field
        if (key === "term") {
          searchterm.value = route.query[value.q] as string;
        }

        // searchInterface settings
        if (key === "useDomain") {
          searchInterface.value.useDomain = route.query[value.q] === "true";
        }
        // search termbases is a list
        else if (key === "termbase") {
          const tbs = route.query[value.q] as string;
          searchInterface.value.termbase = tbs.split(",") as Samling[];
        }
        // searchdomain needs to be handled differently because state is a list
        else if (key === "domain") {
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
