<template>
  <div
    class="flex h-10 grow items-stretch rounded border border-solid border-gray-300"
  >
    <input
      id="searchfield"
      ref="searchfield"
      v-model="searchterm"
      type="search"
      class="form-control min-w-0 flex-auto rounded border border-white bg-white bg-clip-padding px-3 py-1.5 text-base font-normal text-gray-700 transition ease-in-out focus:border focus:border-tpblue-300 focus:bg-white focus:text-gray-700 focus:outline-none"
      :placeholder="
        $t('searchBar.search') +
        (searchInterface.language !== 'all'
          ? ` ${$t('searchBar.inLanguage')} ${$t(
              `global.lang.${searchInterface.language}`,
              2
            )}`
          : '') +
        (searchInterface.termbase !== 'all'
          ? ` ${$t('searchBar.inDomain')} ${$t(
              'global.samling.' + searchInterface.termbase
            )}`
          : searchInterface.domain[0] !== 'all'
          ? ` ${$t('searchBar.inDomain')} ${$t('global.domain.domain', 2)} ${$t(
              'global.domain.' + searchInterface.domain.slice(-1)
            )}`
          : '')
      "
      :aria-label="
        $t('searchBar.search') +
        (searchInterface.language !== 'all'
          ? ` ${$t('searchBar.inLanguage')} ${$t(
              `global.lang.${searchInterface.language}`,
              2
            )}`
          : '') +
        (searchInterface.termbase !== 'all'
          ? ` ${$t('searchBar.inDomain')} ${$t(
              'global.samling.' + searchInterface.termbase
            )}`
          : searchInterface.domain[0] !== 'all'
          ? ` ${$t('searchBar.inDomain')} ${$t('global.domain.domain', 2)} ${$t(
              'global.domain.' + searchInterface.domain.slice(-1)
            )}`
          : '')
      "
      aria-describedby="searchbutton"
      @keypress.enter="execSearch"
      @focus="$event.target.select()"
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
      class="tp-searchbutton-radius inline-block h-full w-14 items-center bg-tpblue-400 text-white transition duration-200 ease-in-out hover:bg-blue-700 focus:bg-blue-700 focus:outline-none active:bg-blue-800"
      type="button"
      :aria-label="$t('searchBar.searchButtonLabel')"
      @click="execSearch"
    >
      <Icon name="ic:outline-search" size="2em" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const searchInterface = useSearchInterface();
const searchterm = useSearchterm();

const clearText = () => {
  searchterm.value = "";
  searchfield.focus();
};

function execSearch() {
  const myparams = route.query;
  updateSearchHistory(searchterm.value);
  searchInterface.value.term = searchterm.value;
  myparams.q = searchInterface.value.term;
  router.push({
    path: "/search",
    force: true,
    query: myparams,
  });
}

function updateSearchHistory(searchterm: string) {
  const searchHistory = useSearchHistory();
  const cookie = useCookie("searchhistory", {
    ...cookieDefaultOptions,
    ...{ httpOnly: false },
  });
  if (searchHistory.value.includes(searchterm)) {
    const index = searchHistory.value.indexOf(searchterm);
    searchHistory.value.splice(index, 1);
  }
  searchHistory.value.unshift(searchterm);
  if (searchHistory.value.length > 20) {
    searchHistory.value.pop();
  }
  cookie.value = JSON.stringify(searchHistory.value);
}
</script>
