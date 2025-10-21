<template>
  <nav
    v-if="showSearchFilter"
    :id="`filterCard-${placement}`"
    class="h-full border-gray-300 pr-1 xl:border-r xl:pt-11"
  >
    <div class="flex justify-between pb-2 pr-1 pt-1 text-2xl">
      <div class="flex space-x-6">
        <h2>{{ $t("searchFilter.filter") }}</h2>
        <UtilsTransitionOpacity>
          <IconSpinner
            v-if="searchDataPending.aggregate"
            size="0.8em"
            class="mt-0.5"
          />
        </UtilsTransitionOpacity>
      </div>
      <button
        v-if="filterSelected"
        class="cursor-pointer rounded-sm border border-transparent px-1 text-gray-600 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-800"
        @click="
          resetSearchFilterSelection(),
          useFetchSearchData(useGenSearchOptions('filter'))
        "
      >
        <IconReset size="1em" />
        <span class="sr-only">{{ $t("searchFilter.resetFilter") }}</span>
      </button>
    </div>
    <div
      class="grid grid-cols-1 gap-4 rounded border-gray-300 xs:grid-cols-2 md:grid-cols-4 xl:grid-cols-1"
    >
      <template
        v-for="{ title, key, data } in filterSections()"
        :key="title"
      >
        <SearchFilterFieldset
          v-if="displaySection(key, data)"
          :title="title"
          :filter-key="key"
        >
          <SearchFilterCheckbox
            v-for="d in data"
            :key="d"
            :ftype="key"
            :fvalue="d"
            :placement="placement"
          />
        </SearchFilterFieldset>
      </template>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { resetSearchFilterSelection, useFetchSearchData, useGenSearchOptions } from "#imports";

import { useI18n } from "vue-i18n";

const appConfig = useAppConfig();

const bootstrapData = useBootstrapData();
const orderedTermbases = useOrderedTermbases();
const showSearchFilter = useShowSearchFilter();
const searchDataStats = useSearchDataStats();
const localeLangOrder = useLocaleLangOrder();
const searchInterface = useSearchInterface();
const searchDataPending = useSearchDataPending();
const searchFilterSelection = useSearchFilterSelection();
const i18n = useI18n();

defineProps({
  placement: { type: String, default: "default" },
});

const filterSelected = computed(() => {
  const sfs = searchFilterSelection.value;
  const combined = [
    ...sfs.context,
    ...sfs.lang,
    ...sfs.matching,
    ...sfs.predicate,
  ];
  return combined.length > 0;
});

const filterSections = () => {
  return [
    {
      title: i18n.t("global.language"),
      key: "lang",
      data: intersectUnique(
        localeLangOrder.value,
        Object.keys(searchDataStats.value.lang || {}),
      ),
    },
    {
      title: null,
      key: "context",
      data: searchInterface.value.useDomain
      // TODO
        ? intersectUnique(
            bootstrapData.value?.domain
              ? flattenDict(bootstrapData.value.domain, "subdomains")
                  .map(domain => domain[0])
              : [],
            Object.keys(searchDataStats.value.context || {}))
        : intersectUnique(
            orderedTermbases.value.map(tb => `${tb}-3A${tb}`),
            Object.keys(searchDataStats.value.context || {})),

    },
    {
      title: i18n.t("searchFilter.termproperty"),
      key: "predicate",
      data: intersectUnique(
        appConfig.data.predicates,
        Object.keys(searchDataStats.value.predicate || {}),
      ),
    },
    {
      title: i18n.t("searchFilter.matching"),
      key: "matching",
      data: intersectUnique(
        appConfig.data.matching,
        Object.keys(searchDataStats.value.matching || {}),
      ),
    },
  ];
};

const displaySection = (key, data) => {
  // don't display language filter if language selected in search interface
  // or english and lang range included
  if (key === "lang") {
    return (
      searchInterface.value.language === "all"
      || (searchInterface.value.language === "en"
        && (data.includes("en-gb") || data.includes("en-us")))
    );
  }
  // Don't display matching filter if no matching data, e.g. no search term/all query
  else if (key === "matching") {
    return data.length !== 0;
  }
  else {
    return true;
  }
};
</script>
