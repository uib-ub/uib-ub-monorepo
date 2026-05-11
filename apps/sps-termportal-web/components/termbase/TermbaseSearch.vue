<template>
  <div class="">
    <h2 class="mb-3 text-xl">
      {{ $t("searchBar.search") }}
    </h2>
    <div class="space-y-1.5">
      <SearchFieldTermbase
        class="max-w-[51em] grow"
        :termbase-id="termbaseId"
      />
      <div class="flex flex-wrap gap-x-6 gap-y-2 pb-1 pl-1">
        <SearchDropdownWrapper target="language">
          <DropdownPV
            v-model="searchLanguageTermbase"
            aria-labelledby="languageDropdownLabel"
            :options="optionsLanguage"
            class="min-w-44"
          />
        </SearchDropdownWrapper>
        <SearchDropdownWrapper target="translate">
          <DropdownPV
            v-model="searchTranslateTermbase"
            aria-labelledby="translateDropdownLabel"
            :options="optionsTranslate"
            class="min-w-24"
          />
        </SearchDropdownWrapper>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const appConfig = useAppConfig();
const termpostViewOnlyLangs = appConfig.language.dataDisplayOnly;

const bootstrapData = useBootstrapData();
const localeLangOrder = useLocaleLangOrder();

const searchLanguageTermbase = useSearchLanguageTermbase();
const searchTranslateTermbase = useSearchTranslateTermbase();

const props = defineProps({ termbaseId: { type: String, required: true } });

const optionsLanguage = computed(() => {
  const intersection = intersectUnique(
    localeLangOrder.value.filter(lc => !termpostViewOnlyLangs.includes(lc)),
    bootstrapData.value?.termbase?.[props.termbaseId]?.language,
  );
  const options = [
    {
      label: $t("global.lang.all") + ` (${intersection.length})`,
      value: "all",
    },
  ].concat(
    intersection.map((lang) => {
      return { label: $t("global.lang." + lang), value: lang };
    }),
  );
  return options;
});

const optionsTranslate = computed(() => {
  const intersection = intersectUnique(
    localeLangOrder.value.filter(lc => !termpostViewOnlyLangs.includes(lc)),
    bootstrapData.value?.termbase?.[props.termbaseId]?.language,
  );
  const options = [
    {
      label: $t("global.lang.none"),
      value: "none",
    },
  ].concat(
    intersection.map((lang) => {
      return { label: $t("global.lang." + lang), value: lang };
    }),
  );
  return options;
});

onMounted(() => {
  searchLanguageTermbase.value = "all";
  searchTranslateTermbase.value = "none";
});
</script>
