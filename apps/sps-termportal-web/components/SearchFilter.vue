<template>
  <section v-if="showSearchFilter" id="filterCard" class="mt-2 xl:pr-5">
    <h2 class="pb-2 pt-1 text-2xl">{{ $t("searchFilter.filter") }}</h2>
    <div
      class="grid grid-cols-1 gap-4 rounded border border-gray-300 p-2 xs:grid-cols-2 md:grid-cols-4 xl:w-[16em] xl:grid-cols-1"
    >
      <template
        v-for="{ title, key, data } in [
          {
            title: $t('global.language'),
            key: 'lang',
            data: intersectUnique(
              localeLangOrder,
              Object.keys(searchDataStats.lang || {})
            ),
          },
          {
            title: $t('global.context'),
            key: 'context',
            fkey: 'context',
            data: Object.keys(searchDataStats.context || {}).sort(),
          },
          {
            title: $t('searchFilter.termproperty'),
            key: 'predicate',
            data: intersectUnique(
              predicateOrder,
              Object.keys(searchDataStats.predicate || {})
            ),
          },
          {
            title: $t('searchFilter.matching'),
            key: 'matching',
            data: intersectUnique(
              matchingOrder,
              Object.keys(searchDataStats.matching || {})
            ),
          },
        ]"
        :key="title"
      >
        <SearchFilterFieldset
          v-if="displaySection(key)"
          :title="title"
          :fkey="key"
          class="pt-1"
        >
          <FilterCheckbox
            v-for="d in data"
            :key="d"
            :ftype="key"
            :fvalue="d"
            class="pl-2"
          />
        </SearchFilterFieldset>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
const showSearchFilter = useShowSearchFilter();
const searchDataStats = useSearchDataStats();
const localeLangOrder = useLocaleLangOrder();
const searchInterface = useSearchInterface();

const displaySection = (key) => {
  if (key === "lang" && searchInterface.value.language !== "all") {
    return false;
  } else {
    return true;
  }
};
</script>
