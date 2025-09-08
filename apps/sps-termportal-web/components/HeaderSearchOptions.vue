<template>
  <div class="flex flex-wrap gap-x-6 gap-y-2 pb-1 pl-1">
    <SearchDropdownWrapper target="language">
      <DropdownPV
        v-model="searchInterface.language"
        aria-labelledby="languageDropdownLabel"
        :options="optionsLanguage"
        class="min-w-44"
      />
    </SearchDropdownWrapper>
    <SearchDropdownWrapper target="translate">
      <DropdownPV
        v-model="searchInterface.translate"
        aria-labelledby="translateDropdownLabel"
        :options="optionsTranslate"
        class="min-w-24"
      />
    </SearchDropdownWrapper>

    <button
      class="tp-transition-shadow group ml-[-0.6rem] flex space-x-2 rounded-[7px] border border-transparent px-2 pb-1 pt-0.5 outline-none hover:cursor-pointer hover:border-tpblue-300 focus:border-tpblue-300 focus:shadow-tphalo"
      @click="searchInterface.useDomain = !searchInterface.useDomain"
    >
      <div>{{ $t("global.domain.domainCap") }}</div>
      <div class="h-4 rotate-180 pb-6">
        <InputSwitch
          v-model="searchInterface.useDomain"
          aria-labelledby="domainSwitchLabel"
          @click.stop="false"
        />
        <span
          id="domainSwitchLabel"
          class="sr-only"
        >Use domain search.</span>
      </div>
      <div>{{ $t("global.termbase", 0) }}</div>
    </button>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";

const appConfig = useAppConfig();
const termpostViewOnlyLangs = appConfig.language.dataDisplayOnly;

const i18n = useI18n();
const searchInterface = useSearchInterface();
const localeLangOrder = useLocaleLangOrder();
const orderedTermbases = useOrderedTermbases();
const bootstrapData = useBootstrapData();

const languageInfo = deriveLanguageInfo(localeLangOrder.value);

const optionsLanguage = computed(() => {
  const filteredLangs = deriveSearchOptions("language", "all");
  const intersection = intersectUnique(
    localeLangOrder.value.filter(lc => !termpostViewOnlyLangs.includes(lc)),
    filteredLangs,
  );
  const options = [
    {
      label: i18n.t("global.lang.all") + ` (${intersection.length})`,
      value: "all",
    },
  ].concat(
    intersection.map((lang) => {
      return { label: i18n.t("global.lang." + lang), value: lang };
    }),
  );
  return options;
});

const optionsTranslate = computed(() => {
  const filteredTranslate = deriveSearchOptions("translate", "none");
  const intersection = intersectUnique(
    localeLangOrder.value.filter(lc => !termpostViewOnlyLangs.includes(lc)),
    filteredTranslate,
  );
  const options = [
    {
      label: i18n.t("global.lang.none"),
      value: "none",
    },
  ].concat(
    intersection.map((lang) => {
      return { label: i18n.t("global.lang." + lang), value: lang };
    }),
  );
  return options;
});

const optionsTermbase = computed(() => {
  const filteredTermbases = deriveSearchOptions("termbase", "all");
  const options = [
    {
      label: i18n.t("global.samling.all") + ` (${filteredTermbases.length})`,
      value: "all",
    },
  ].concat(
    filteredTermbases.map((tb) => {
      return { label: i18n.t("global.samling." + tb), value: tb };
    }),
  );
  return options;
});

function filterTermbases(termbases, filterTermbases, option, defaultValue) {
  let termbasesOut = termbases;
  if (searchInterface.value[option] !== defaultValue) {
    termbasesOut = intersectUnique(filterTermbases, termbases);
  }

  return termbasesOut;
}

function deriveSearchOptions(searchOption, defaultValue) {
  // TODO optimize, create list of languages of domains/termbases
  const currentValue = searchInterface.value[searchOption];
  let termbases = orderedTermbases.value;
  let options;

  if (searchOption !== "language") {
    termbases = filterTermbases(
      termbases,
      languageInfo[searchInterface.value.language],
      "language",
      "all",
    );
  }

  if (searchOption !== "translate") {
    termbases = filterTermbases(
      termbases,
      languageInfo[searchInterface.value.translate],
      "translate",
      "none",
    );
  }

  if (searchOption !== "termbase") {
    /*
    termbases = filterTermbases(
      termbases,
      [searchInterface.value.termbase],
      "termbase",
      "all"
    );
    */

    if (termbases.length !== orderedTermbases.value.length) {
      const languages = [
        ...new Set(
          termbases
            .map(tb => bootstrapData.value.termbase[tb].language)
            .flat(),
        ),
      ];
      options = intersectUnique(localeLangOrder.value, languages);
    }
    else {
      options = localeLangOrder.value;
    }
  }
  else {
    options = termbases;
  }

  if (!options.includes(currentValue)) {
    searchInterface.value[searchOption] = defaultValue;
  }
  return options;
}
</script>
