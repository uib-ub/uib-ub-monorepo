<template>
  <nav
    v-if="showSearchFilter"
    :id="`filterCard-${placement}`"
    class="h-full border-gray-300 pr-1 xl:border-r xl:pt-11"
  >
    <div class="flex pb-2 pt-1 text-2xl justify-between pr-1">
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
        class="px-1 text-gray-600 border border-transparent rounded-sm hover:text-gray-800 hover:bg-gray-100 hover:border-gray-300"
        @click="
          resetSearchFilterSelection(),
            useFetchSearchData(useGenSearchOptions('filter'))
        "
      >
        <IconReset size="1em" />
      </button>
    </div>
    <div
      class="grid grid-cols-1 gap-4 rounded border-gray-300 xs:grid-cols-2 md:grid-cols-4 xl:grid-cols-1"
    >
      <template v-for="{ title, key, data } in filterSections()" :key="title">
        <SearchFilterFieldset
          v-if="displaySection(key, data)"
          :title="title"
          :fkey="key"
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
import { useI18n } from "vue-i18n";

const showSearchFilter = useShowSearchFilter();
const searchDataStats = useSearchDataStats();
const localeLangOrder = useLocaleLangOrder();
const searchInterface = useSearchInterface();
const searchDataPending = useSearchDataPending();
const searchFilterSelection = useSearchFilterSelection();
const i18n = useI18n();

const props = defineProps({
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
        Object.keys(searchDataStats.value.lang || {})
      ),
    },
    {
      title: "",
      key: "context",
      fkey: "context",
      data: searchInterface.value.useDomain
        ? flattenOrderDomains(Object.keys(searchDataStats.value.context || {}))
        : Object.keys(searchDataStats.value.context || {}).sort(),
    },
    {
      title: i18n.t("searchFilter.termproperty"),
      key: "predicate",
      data: intersectUnique(
        predicateOrder,
        Object.keys(searchDataStats.value.predicate || {})
      ),
    },
    {
      title: i18n.t("searchFilter.matching"),
      key: "matching",
      data: intersectUnique(
        matchingOrder,
        Object.keys(searchDataStats.value.matching || {})
      ),
    },
  ];
};

const displaySection = (key, data) => {
  // don't display language filter if language selected in search interface
  // or english and lang range included
  if (key === "lang") {
    return (
      searchInterface.value.language === "all" ||
      (searchInterface.value.language === "en" &&
        (data.includes("en-gb") || data.includes("en-us")))
    );
  }
  // Don't display matching filter if no matching data, e.g. no search term/all query
  else if (key === "matching") {
    return data.length !== 0;
  } else {
    return true;
  }
};
</script>
