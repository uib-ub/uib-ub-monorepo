<template>
  <div class="flex flex-wrap gap-x-6 gap-y-2 py-1">
    <SearchDropdownWrapper target="language">
      <DropdownPV
        :id="`languageDropdown`"
        v-model="searchInterface.language"
        :options="optionsLanguage"
        class="min-w-[11rem]"
      />
    </SearchDropdownWrapper>
    <SearchDropdownWrapper target="translate">
      <DropdownPV
        :id="`translateDropdown`"
        v-model="searchInterface.translate"
        :options="optionsTranslate"
        class="min-w-[6rem]"
      />
    </SearchDropdownWrapper>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
const i18n = useI18n();
const searchInterface = useSearchInterface();
const localeLangOrder = useLocaleLangOrder();

const optionsLanguage = computed(() => {
  const filteredLangs = deriveSearchOptions("language", "all");
  const intersection = intersectUnique(localeLangOrder, filteredLangs);
  const options = [
    {
      label: i18n.t("global.lang.all") + ` (${intersection.length})`,
      value: "all",
    },
  ].concat(
    intersection.map((lang) => {
      return { label: i18n.t("global.lang." + lang), value: lang };
    })
  );
  return options;
});

const optionsTranslate = computed(() => {
  const filteredTranslate = deriveSearchOptions("translate", "none");
  const intersection = intersectUnique(localeLangOrder, filteredTranslate);
  const options = [
    {
      label: i18n.t("global.lang.none"),
      value: "none",
    },
  ].concat(
    intersection.map((lang) => {
      return { label: i18n.t("global.lang." + lang), value: lang };
    })
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
    })
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
  const topdomain = "all";
  const currentValue = searchInterface.value[searchOption];
  let termbases = termbaseOrder;
  let options;
  if (topdomain !== "all") {
    termbases = domainNesting[topdomain]?.bases;
  }

  if (searchOption !== "language") {
    termbases = filterTermbases(
      termbases,
      languageInfo[searchInterface.value.language],
      "language",
      "all"
    );
  }

  if (searchOption !== "translate") {
    termbases = filterTermbases(
      termbases,
      languageInfo[searchInterface.value.translate],
      "translate",
      "none"
    );
  }

  if (searchOption !== "termbase") {
    termbases = filterTermbases(
      termbases,
      [searchInterface.value.termbase],
      "termbase",
      "all"
    );

    if (termbases.length !== termbaseOrder.length) {
      const languages = [
        ...new Set(termbases.map((tb) => termbaseInfo[tb]).flat()),
      ];
      options = intersectUnique(localeLangOrder, languages);
    } else {
      options = localeLangOrder;
    }
  } else {
    options = termbases;
  }

  if (!options.includes(currentValue)) {
    searchInterface.value[searchOption] = defaultValue;
  }
  return options;
}
</script>
