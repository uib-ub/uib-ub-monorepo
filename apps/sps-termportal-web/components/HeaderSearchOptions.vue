<template>
  <div class="flex flex-wrap gap-x-3">
    <SearchDropdownWrapper target="language">
      <DropdownPV
        :id="`languageDropdown`"
        v-model="searchInterface.language"
        :options="optionsLanguage"
        class="min-w-[11rem]"
      />
    </SearchDropdownWrapper>

    <SearchBarDropdown dropdown="translate" dd-width="5.5em">
      <option value="none">
        {{ $t("global.lang.none") }}
      </option>
      <option
        v-for="lc in intersectUnique(localeLangOrder, filteredTranslationLangs)"
        :key="'translationlang_' + lc"
        :value="lc"
      >
        {{ $t("global.lang." + lc) }}
      </option>
    </SearchBarDropdown>
    <SearchBarDropdown dropdown="termbase" dd-width="20em">
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

// intersectUnique(localeLangOrder, filteredSearchLangs)
const filteredSearchLangs = computed(() => {
  return deriveSearchOptions("language", "all");
});
const optionsLanguag = computed(() => {
  const lst = [
    {
      label: i18n.t("global.lang.all") + ` (${props.optionsLang.length})`,
      value: "all",
    },
  ].concat(
    props.optionsLang.map((lang) => {
      return { label: i18n.t("global.lang." + lang), value: lang };
    })
  );
  return lst;
});

const filteredTranslationLangs = computed(() => {
  return deriveSearchOptions("translate", "none");
});

const filteredTermbases = computed(() => {
  return deriveSearchOptions("termbase", "all");
});

function filterTermbases(termbases, filterTermbases, option, defaultValue) {
  let termbasesOut = termbases;
  if (searchInterface.value[option] !== defaultValue) {
    termbasesOut = intersectUnique(filterTermbases, termbases);
  }

  return termbasesOut;
}

function deriveSearchOptions(searchOption, defaultValue) {
  const topdomain = searchInterface.value.domain[0];
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
