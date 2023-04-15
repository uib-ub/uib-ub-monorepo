import { SearchDataStats, SearchOptions } from "./states";
import { SearchQueryResponse, Matching, MatchingNested } from "~~/utils/vars";

export async function fetchSearchDataMatching(
  searchOptions: SearchOptions,
  matching: string[],
  append: boolean,
  currentFetch: number,
  querySituation
) {
  const searchData = useSearchData();
  const searchFetchLatest = useSearchFetchLatest();
  const data = await $fetch("/api/search/entries", {
    method: "POST",
    body: { searchOptions, matching, situation: querySituation },
  });

  if (currentFetch === searchFetchLatest.value) {
    if (append) {
      searchData.value = searchData.value.concat(data);
    } else {
      searchData.value = data;
    }
  }
}

export type FetchType = "initial" | "filter" | "further" | "options";
async function fetchSearchDataAggregate(
  searchOptions: SearchOptions,
  matching: string[],
  type: FetchType,
  currentFetch: number
) {
  const searchDataStats = useSearchDataStats();
  const searchFetchLatest = useSearchFetchLatest();
  const searchDataPending = useSearchDataPending();

  const aggregate = await $fetch("/api/search/aggregate", {
    method: "POST",
    body: { searchOptions, matching, situation: type },
  });

  if (currentFetch === searchFetchLatest.value) {
    if (type === "initial" || type === "options") {
      searchDataStats.value = aggregate;
    } else if (type === "filter") {
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

export async function useFetchSearchData(
  searchOptions: SearchOptions,
  fetchType: FetchType,
  matching?: MatchingNested[]
) {
  const searchData = useSearchData();
  const searchFetchLatest = useSearchFetchLatest();
  const searchDataPending = useSearchDataPending();
  const searchFilterData = useSearchFilterData();
  const searchFetchInitial = useSearchFetchInitial();
  const route = useRoute();
  let append = false;
  const fetchTime = Date.now();
  searchFetchLatest.value = fetchTime;

  let searchMatching: MatchingNested[] | "all"[];

  if (matching) {
    searchMatching = matching;
  } else if (searchOptions.searchTerm.length > 0) {
    if (typeof searchOptions.searchMatching === "string") {
      searchMatching = [searchOptions.searchMatching];
    } else {
      searchMatching = searchOptions.searchMatching;
    }
  } else {
    searchMatching = ["all"];
  }

  if (fetchType === "initial") {
    if (route.path === "/search") {
      searchFetchInitial.value = true;
    }
    searchFilterData.value = {
      lang: [],
      samling: [],
      predicate: [],
      matching: [],
    };
  }

  if (
    fetchType === "initial" ||
    fetchType === "filter" ||
    fetchType === "options"
  ) {
    searchDataPending.value.aggregate = true;
    fetchSearchDataAggregate(
      searchOptions,
      searchMatching.flat(),
      fetchType,
      fetchTime
    );
  }

  if (fetchType === "further") {
    append = true;
  }

  searchDataPending.value.entries = true;
  let qCount = 0;
  for (const m of searchMatching) {
    qCount++;
    await fetchSearchDataMatching(
      searchOptions,
      Array.isArray(m) ? m : [m],
      append,
      fetchTime,
      fetchType + qCount
    );
    append = true;
    if (fetchTime !== searchFetchLatest.value) {
      break;
    }
    if (countSearchEntries(searchData.value) >= searchOptions.searchLimit) {
      break;
    }
  }
  if (fetchTime === searchFetchLatest.value) {
    searchDataPending.value.entries = false;
  }
}
