<template>
  <section v-if="showSearchFilter" id="filterCard" class="mt-2 xl:pr-5">
    <h2 class="pb-2 pt-1 text-2xl">{{ $t("searchFilter.filter") }}</h2>
    <div
      class="xs:grid-cols-2 grid grid-cols-1 gap-4 rounded border border-gray-300 p-2 md:grid-cols-4 xl:w-[16em] xl:grid-cols-1"
    >
      <template
        v-for="{ title, key, data } in [
                { title: $t('global.language'),
                  key: 'lang',
                  data: intersectUnique(
                        languageOrder[$i18n.locale as LocalLangCode],
                        Object.keys(searchDataStats.lang || {})) },
                { title: $t('global.termbase'),
                  key:'samling',
                  data: Object.keys(searchDataStats.samling || {}).sort()},
                { title: $t('searchFilter.termproperty'),
                  key: 'predicate',
                  data: intersectUnique(
                    predicateOrder,
                    Object.keys(searchDataStats.predicate || {})
                  )
                },
                { title: $t('searchFilter.matching'),
                  key: 'matching',
                  data: intersectUnique(
                        matchingOrder,
                        Object.keys(searchDataStats.matching || {})
                  )}
              ]"
        :key="title"
      >
        <SearchFilterFieldset v-if="data.length > 0" :title="title">
          <FilterCheckbox v-for="d in data" :key="d" :ftype="key" :fvalue="d" />
        </SearchFilterFieldset>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { LocalLangCode } from "~~/utils/vars-language";

const showSearchFilter = useShowSearchFilter();
const searchDataStats = useSearchDataStats();
</script>
