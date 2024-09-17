<template>
  <nav
    v-if="showSearchFilter"
    :id="`filterCard-${placement}`"
    class="h-full border-gray-300 pr-1 xl:border-r xl:pt-12"
  >
    <h2 class="pb-2 pt-1 text-2xl">{{ $t("searchFilter.filter") }}</h2>
    <div
      class="grid grid-cols-1 gap-4 rounded border-gray-300 xs:grid-cols-2 md:grid-cols-4 xl:grid-cols-1"
    >
      <template v-for="{ title, key, data } in filterSections()" :key="title">
        <SearchFilterFieldset
          v-if="displaySection(key, data)"
          :title="title"
          :fkey="key"
        >
          <FilterCheckbox
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
const i18n = useI18n();

const props = defineProps({
  placement: { type: String, default: "default" },
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
