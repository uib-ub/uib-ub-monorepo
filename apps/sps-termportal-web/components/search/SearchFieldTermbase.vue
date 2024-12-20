<template>
  <div
    class="flex h-10 grow items-stretch rounded-[7px] border border-solid border-gray-300"
  >
    <AutoComplete
      id="navbarautocomplete"
      v-model="searchtermTermbase"
      :suggestions="items"
      :placeholder="placeholder"
      :aria-label="placeholder"
      dropdown-mode="current"
      @complete="search"
      @exec-search="execSearch"
      @focus="$event.target.select()"
    />
    <button
      id="searchbutton"
      class="inline-block h-full w-14 items-center rounded-r-md bg-tpblue-400 text-white transition duration-200 ease-in-out hover:bg-blue-700 focus:bg-blue-700 focus:outline-none active:bg-blue-800"
      type="button"
      :aria-label="$t('searchBar.searchButtonLabel')"
      @click="execSearch"
    >
      <Icon name="ic:outline-search" size="2em" aria-hidden="true" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const i18n = useI18n();
const route = useRoute();
const router = useRouter();
const searchInterface = useSearchInterface();
const searchterm = useSearchterm();
const searchtermTermbase = useSearchtermTermbase();
const searchLanguageTermbase = useSearchLanguageTermbase();
const searchTranslateTermbase = useSearchTranslateTermbase();

const items = ref([]);

const props = defineProps({ termbaseId: { type: String, required: true } });

const search = async (event) => {
  const term = event.query;
  items.value = await useAutoCompleteSuggestions(
    term,
    props.termbaseId,
    searchLanguageTermbase.value !== "all"
      ? searchLanguageTermbase.value
      : undefined
  );
  // items.value = [...Array(10).keys()].map((item) => event.query + "-" + item);
};

const termbaselabel = lalof(`${props.termbaseId}-3A${props.termbaseId}`);
const placeholder = computed(() => {
  return (
    i18n.t("searchBar.search") +
    (searchLanguageTermbase.value !== "all"
      ? ` ${i18n.t("searchBar.inLanguage")} ${i18n.t(
          `global.lang.${searchLanguageTermbase.value}`,
          2
        )}`
      : "") +
    ` ${i18n.t("searchBar.in")} ` +
    termbaselabel
  );
});

const clearText = () => {
  searchtermTermbase.value = "";
  // navbarautocomplete.focus();
};

function execSearch() {
  const allowSearchFetch = useAllowSearchFetch();
  const myparams = route.query;
  searchterm.value = searchtermTermbase.value;
  searchInterface.value.term = searchtermTermbase.value;
  searchInterface.value.language = searchLanguageTermbase.value;
  searchInterface.value.translate = searchTranslateTermbase.value;
  searchInterface.value.useDomain = false;
  searchInterface.value.termbase = [props.termbaseId];
  myparams.q = searchInterface.value.term;
  myparams.tb = props.termbaseId;
  myparams.ud = "false";
  if (searchLanguageTermbase.value !== "all") {
    myparams.ss = searchLanguageTermbase.value;
  }
  if (searchTranslateTermbase.value !== "none") {
    myparams.ms = searchTranslateTermbase.value;
  }

  allowSearchFetch.value = true;
  router.push({
    path: "/search",
    force: true,
    query: myparams,
  });
}

onMounted(() => {
  searchtermTermbase.value = "";
});
</script>

<style>
#navbarautocomplete_0 {
  display: none;
}

#searchbutton:focus {
  border: 1px solid theme("colors.tpblue.300");
  transition-property: box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 100ms;
  @apply shadow-tphalo;
}

.p-autocomplete {
  flex-grow: 1;
}

.p-autocomplete-input {
  flex-grow: 1;
}

.p-autocomplete .p-component {
  border-color: white;
}

.p-autocomplete .p-component:hover {
  border: 1px solid theme("colors.tpblue.300");
}

.p-autocomplete .p-component:focus {
  border: 1px solid theme("colors.tpblue.300");
}
</style>
