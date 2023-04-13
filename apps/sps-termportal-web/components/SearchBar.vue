<template>
  <div
    class="max-w-full grow"
    role="search"
    :class="{
      'xs:pt-3 pt-2 sm:pt-4 md:pt-5 lg:pt-6 xl:pt-7': !expandSearchBar,
    }"
  >
    <div
      v-if="expandSearchBar"
      class="xs:pt-4 pt-2 sm:pt-5 md:pt-7 lg:pt-8 xl:pt-9"
    >
      <DomainTabs class="hidden md:block" />
      <DomainMenu class="md:hidden" />
    </div>
    <div
      class="flex h-11 items-stretch rounded border border-solid border-gray-300"
    >
      <input
        id="searchfield"
        v-model="searchterm"
        type="search"
        class="form-control focus:border-tpblue-300 min-w-0 flex-auto rounded border border-white bg-white bg-clip-padding px-3 py-1.5 text-base font-normal text-gray-700 transition ease-in-out focus:border focus:bg-white focus:text-gray-700 focus:outline-none"
        :placeholder="
          $t('searchBar.search') +
          (searchOptions.searchLanguage !== 'all'
            ? ` ${$t('searchBar.inLanguage')} ${$t(
                `global.lang.${searchOptions.searchLanguage}`,
                2
              )}`
            : '') +
          (searchOptions.searchBase !== 'all'
            ? ` ${$t('searchBar.inDomain')} ${$t(
                'global.samling.' + searchOptions.searchBase
              )}`
            : searchOptions.searchDomain[0] !== 'all'
            ? ` ${$t('searchBar.inDomain')} ${$t(
                'global.domain.domain',
                2
              )} ${$t('global.domain.' + searchOptions.searchDomain.slice(-1))}`
            : '')
        "
        :aria-label="
          $t('searchBar.search') +
          (searchOptions.searchLanguage !== 'all'
            ? ` ${$t('searchBar.inLanguage')} ${$t(
                `global.lang.${searchOptions.searchLanguage}`,
                2
              )}`
            : '') +
          (searchOptions.searchBase !== 'all'
            ? ` ${$t('searchBar.inDomain')} ${$t(
                'global.samling.' + searchOptions.searchBase
              )}`
            : searchOptions.searchDomain[0] !== 'all'
            ? ` ${$t('searchBar.inDomain')} ${$t(
                'global.domain.domain',
                2
              )} ${$t('global.domain.' + searchOptions.searchDomain.slice(-1))}`
            : '')
        "
        aria-describedby="searchbutton"
        @keypress.enter="execSearch"
        @focus="$event.target.select(), (searchBarWasFocused = true)"
      />
      <button
        v-if="searchterm.length > 0"
        type="button"
        class="flex w-8 items-center justify-center"
        :aria-label="$t('searchBar.clearTextLabel')"
        @click="clearText"
      >
        <Icon
          name="ic:sharp-clear"
          size="1.4em"
          class="text-gray-600"
          aria-hidden="true"
        />
      </button>
      <button
        id="searchbutton"
        class="bg-tpblue-400 tp-searchbutton-radius inline-block h-full w-24 items-center text-white transition duration-200 ease-in-out hover:bg-blue-700 focus:bg-blue-700 focus:outline-none active:bg-blue-800"
        type="button"
        :aria-label="$t('searchBar.searchButtonLabel')"
        @click="execSearch"
      >
        <Icon name="ic:outline-search" size="2em" aria-hidden="true" />
      </button>
    </div>
    <div
      v-if="expandSearchBar"
      class="xs:px-1 flex flex-wrap gap-x-3 pt-2 sm:text-lg"
    >
      <SearchBarDropdown dropdown="searchLanguage" dd-width="7.8em">
        <option value="all">
          {{ $t("global.lang.all") }} ({{ filteredSearchLangs.length }})
        </option>
        <option
          v-for="lc in intersectUnique(
            languageOrder[$i18n.locale],
            filteredSearchLangs
          )"
          :key="'searchlang_' + lc"
          :value="lc"
        >
          {{ $t("global.lang." + lc) }}
        </option>
      </SearchBarDropdown>
      <SearchBarDropdown dropdown="searchTranslate" dd-width="5.5em">
        <option value="none">
          {{ $t("global.lang.none") }}
        </option>
        <option
          v-for="lc in intersectUnique(
            languageOrder[$i18n.locale],
            filteredTranslationLangs
          )"
          :key="'translationlang_' + lc"
          :value="lc"
        >
          {{ $t("global.lang." + lc) }}
        </option>
      </SearchBarDropdown>
      <SearchBarDropdown dropdown="searchBase" dd-width="20em">
        <option value="all">
          {{ $t("global.samling.all") }} ({{ filteredTermbases.length }})
        </option>
        <option
          v-for="samling in filteredTermbases"
          :key="'searchsamling_' + samling"
          :value="samling"
        >
          {{ $t("global.samling." + samling) }}
        </option>
      </SearchBarDropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const searchOptions = useSearchOptions();
const searchterm = useSearchterm();
const searchBarWasFocused = useSearchBarWasFocused();
const allowSearchFetch = useAllowSearchFetch();

const expandSearchBar = computed(() => {
  if (
    route.path === "/" ||
    route.path === "/search" ||
    route.name === "termbase-id" ||
    searchBarWasFocused.value
  ) {
    return true;
  } else {
    return false;
  }
});

const filteredSearchLangs = computed(() => {
  return deriveSearchOptions("searchLanguage", "all");
});

const filteredTranslationLangs = computed(() => {
  return deriveSearchOptions("searchTranslate", "none");
});

const filteredTermbases = computed(() => {
  return deriveSearchOptions("searchBase", "all");
});

const clearText = () => {
  searchterm.value = "";
  searchfield.focus();
};

// TODO, add reset filter if searchTerm is not changed
function execSearch() {
  searchOptions.value.searchTerm = searchterm.value;
  allowSearchFetch.value = true;
  usePushSearchOptionsToRoute();
}

watch(
  searchOptions.value,
  () => {
    if (route.path === "/search") {
      usePushSearchOptionsToRoute();
    }
  },
  { deep: true }
);

// TODO refactor, use searchOptionsInfo for default value
// TODO Typing
function filterTermbases(termbases, filterTermbases, option, defaultValue) {
  if (searchOptions.value[option] !== defaultValue) {
    return intersectUnique(filterTermbases, termbases);
  } else {
    return termbases;
  }
}

// TODO refactor, searchOptionsInfo def value
// TODO Typing
function deriveSearchOptions(searchOption, defaultValue) {
  const topdomain = searchOptions.value.searchDomain[0];
  const currentValue = searchOptions.value[searchOption];
  let termbases = termbaseOrder;
  let options;
  if (topdomain !== "all") {
    termbases = domainNesting[topdomain]?.bases;
  }

  if (searchOption !== "searchLanguage") {
    termbases = filterTermbases(
      termbases,
      languageInfo[searchOptions.value.searchLanguage],
      "searchLanguage",
      "all"
    );
  }

  if (searchOption !== "searchTranslate") {
    termbases = filterTermbases(
      termbases,
      languageInfo[searchOptions.value.searchTranslate],
      "searchTranslate",
      "none"
    );
  }

  if (searchOption !== "searchBase") {
    termbases = filterTermbases(
      termbases,
      [searchOptions.value.searchBase],
      "searchBase",
      "all"
    );

    if (termbases.length !== termbaseOrder.length) {
      const languages = [
        ...new Set(termbases.map((tb) => termbaseInfo[tb]).flat()),
      ];
      options = intersectUnique(languageOrder.nb, languages);
    } else {
      options = languageOrder.nb;
    }
  } else {
    options = termbases;
  }

  if (!options.includes(currentValue)) {
    searchOptions.value[searchOption] = defaultValue;
  }
  return options;
}
</script>

<style scoped>
input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
}

.tp-searchbutton-radius {
  border-radius: 0.2rem;
}
</style>
