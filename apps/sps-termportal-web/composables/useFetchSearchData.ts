import { SearchDataStats } from "./states";
import { Matching, SearchOptions } from "~~/utils/vars";

export async function fetchSearchDataMatching(
  searchOptions: SearchOptions,
  append: boolean,
  currentFetch: number
) {
  const searchData = useSearchData();
  const searchFetchLatest = useSearchFetchLatest();
  const data = await $fetch("/api/search/entries", {
    method: "POST",
    body: searchOptions,
    retry: 1,
  });

  if (currentFetch === searchFetchLatest.value) {
    if (append) {
      searchData.value = searchData.value.concat(data);
    } else {
      searchData.value = data;
    }
  }
}

export function resetSearchFilterSelection() {
  const searchFilterSelection = useSearchFilterSelection();
  searchFilterSelection.value = {
    lang: [],
    samling: [],
    predicate: [],
    matching: [],
    context: [],
  };
}

export type FetchType = "initial" | "options" | "filter" | "further";
async function fetchSearchDataAggregate(
  searchOptions: SearchOptions,
  currentFetch: number
) {
  const situation = searchOptions.situation;

  const searchDataStats = useSearchDataStats();
  const searchFetchLatest = useSearchFetchLatest();
  const searchDataPending = useSearchDataPending();

  if (["initial", "options"].includes(situation)) {
    resetSearchFilterSelection();
  }

  const aggregate = await $fetch("/api/search/aggregate", {
    method: "POST",
    body: searchOptions,
    retry: 1,
  });

  if (currentFetch === searchFetchLatest.value) {
    if (["initial", "options"].includes(situation)) {
      searchDataStats.value = aggregate;
    } else if (situation === "filter") {
      const zeroedStats = resetStats(searchDataStats.value, false);
      for (const category of Object.keys(zeroedStats)) {
        searchDataStats.value[category as keyof SearchDataStats] = {
          ...zeroedStats[category as keyof SearchDataStats],
          ...aggregate[category],
        };
      }
    }
    searchDataPending.value.aggregate = false;
  }
}

export async function useFetchSearchData(options: SearchOptions) {
  const searchData = useSearchData();
  const searchFetchLatest = useSearchFetchLatest();
  const searchDataPending = useSearchDataPending();
  const searchFetchInitial = useSearchFetchInitial();
  const route = useRoute();
  let append = false;
  const fetchTime = Date.now();
  searchFetchLatest.value = fetchTime;
  const situation = options.situation;

  // Matomo Events
  pushSearchEvents(options);

  if (situation === "initial" && route.path === "/search") {
    searchFetchInitial.value = true;
  }

  if (
    situation === "initial" ||
    situation === "filter" ||
    situation === "options"
  ) {
    searchDataPending.value.aggregate = true;
    fetchSearchDataAggregate(
      {
        ...options,
        ...{ subtype: "aggregate", matching: options.matching.flat() },
      },
      fetchTime
    );
  }

  if (situation === "further") {
    append = true;
  }

  searchDataPending.value.entries = true;
  let qCount = 0;
  for (const m of options.matching) {
    qCount++;

    await fetchSearchDataMatching(
      {
        ...options,
        ...{
          subtype: "entries",
          matching: m as Matching[],
          situation: `${situation}>${qCount}`,
        },
      },
      append,
      fetchTime
    );

    append = true;
    if (fetchTime !== searchFetchLatest.value) {
      break;
    }
    if (countSearchEntries(searchData.value) >= options.limit) {
      break;
    }
  }
  if (fetchTime === searchFetchLatest.value) {
    searchDataPending.value.entries = false;
  }
}
