<template>
  <div class="">
    <h2 class="text-xl mb-3">{{ $t("searchBar.search") }}</h2>
    <div class="space-y-1.5">
      <SearchFieldTermbase
        class="grow max-w-[51em]"
        :termbase-id="termbaseId"
      />
      <div class="flex flex-wrap gap-x-6 gap-y-2 pb-1 pl-1">
        <SearchDropdownWrapper target="language">
          <DropdownPV
            v-model="searchLanguageTermbase"
            aria-labelledby="languageDropdownLabel"
            :options="optionsLanguage"
            class="min-w-[11rem]"
          />
        </SearchDropdownWrapper>
        <SearchDropdownWrapper target="translate">
          <DropdownPV
            v-model="searchTranslateTermbase"
            aria-labelledby="translateDropdownLabel"
            :options="optionsTranslate"
            class="min-w-[6rem]"
          />
        </SearchDropdownWrapper>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const bootstrapData = useBootstrapData();
const localeLangOrder = useLocaleLangOrder();
const i18n = useI18n();

const searchLanguageTermbase = useSearchLanguageTermbase();
const searchTranslateTermbase = useSearchTranslateTermbase();

const props = defineProps({ termbaseId: { type: String, required: true } });

const optionsLanguage = computed(() => {
  const intersection = intersectUnique(
    localeLangOrder.value.filter(
      (lc) => !dataDisplayOnlyLanguages.includes(lc)
    ),
    bootstrapData.value?.termbase?.[props.termbaseId]?.language
  );
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
  const intersection = intersectUnique(
    localeLangOrder.value.filter(
      (lc) => !dataDisplayOnlyLanguages.includes(lc)
    ),
    bootstrapData.value?.termbase?.[props.termbaseId]?.language
  );
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

onMounted(() => {
  searchLanguageTermbase.value = "all";
  searchTranslateTermbase.value = "none";
});
</script>
