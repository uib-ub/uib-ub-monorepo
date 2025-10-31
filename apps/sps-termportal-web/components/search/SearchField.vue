<template>
  <div
    class="flex h-10 grow items-stretch rounded-[7px] border border-solid border-gray-300"
  >
    <AutoComplete
      id="navbarautocomplete"
      v-model="searchterm"
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
      class="cursor-pointer flex h-full w-14 items-center justify-center rounded-r-[6px] bg-tpblue-400 text-white transition duration-200 ease-in-out hover:bg-blue-700 focus:bg-blue-700 focus:outline-none active:bg-blue-800"
      type="button"
      :aria-label="$t('searchBar.searchButtonLabel')"
      @click="execSearch"
    >
      <Icon
        name="ic:outline-search"
        size="2em"
        aria-hidden="true"
      />
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
const bootstrapData = useBootstrapData();
const { getLaLo } = useLazyLocale();

const items = ref([]);

defineProps({
  termbaseSearch: { type: Boolean, default: false },
});

const search = async (event) => {
  const term = event.query;
  items.value = await useAutoCompleteSuggestions(term);
  // items.value = [...Array(10).keys()].map((item) => event.query + "-" + item);
};

const placeholder = computed(() => {
  const language
    = searchInterface.value.language !== "all"
      ? ` ${i18n.t("searchBar.inLanguage")} ${i18n.t(
        `global.lang.${searchInterface.value.language}`,
        2,
      )}`
      : "";

  const topDomains = intersectUnique(
    bootstrapData.value ? Object.keys(bootstrapData.value.domain) : [],
    Object.keys(searchInterface.value.domain),
  );

  const domains = topDomains.map(domain => getLaLo(domain));

  const termbases = searchInterface.value.termbase.map(tb =>
    getLaLo(`${tb}-3A${tb}`),
  );

  const context = searchInterface.value.useDomain
  // domain
    ? Object.keys(searchInterface.value.domain).length > 0
    // selected domains
      ? topDomains.length === 1
      // one domain selected
        ? ` ${i18n.t("searchBar.inOneDomain")} ${domains.join(", ")}`
        // more than one domain
        : ` ${i18n.t("searchBar.inDomains")} ${domains.join(", ")}`
      // all domains
      : ` ${i18n.t("searchBar.inAllDomains")}`
    // termbase
    : searchInterface.value.termbase.length !== 0
    // specified termbase(s)
      ? ` ${i18n.t("searchBar.in")} ${termbases.join(", ")}`
      // all termbases
      : ` ${i18n.t("searchBar.inAllTermbases")} `;
  return i18n.t("searchBar.search") + language + context;
});

const clearText = () => {
  searchterm.value = "";
  navbarautocomplete.focus();
};

function execSearch() {
  const allowSearchFetch = useAllowSearchFetch();
  const myparams = route.query;
  searchInterface.value.term = searchterm.value;
  myparams.q = searchInterface.value.term;
  allowSearchFetch.value = true;
  router.push({
    path: "/search",
    force: true,
    query: myparams,
  });
}
</script>

<style>
@config "../../tailwind.config.ts";

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
