<template>
  <li class="rounded border border-gray-300">
    <AppLink :to="`/${entryData.link}`">
      <section
        class="py-1.5 px-2 hover:bg-gray-200 lg:flex lg:py-2"
        :class="{
          'sm:flex': searchOptions.searchTranslate === 'none',
        }"
      >
        <div class="grow justify-between sm:flex">
          <div
            class="flex grow justify-between"
            :class="{
              'sm:justify-start': searchOptions.searchTranslate !== 'none',
              'text-right': langRtoL(entryData.lang[0] as LangCode),
              'sm:grow-0': searchOptions.searchTranslate !== 'none'
            }"
          >
            <SearchResultLabel
              :predicate="entryData.predicate"
              :label-data="entryData.label"
              :label-lang="entryData.lang"
            />
            <div
              class="pl-3 font-light lg:hidden"
              :class="{
                hidden:
                  searchOptions.searchTranslate === 'none' &&
                  searchOptions.searchLanguage !== 'all',
                'md:hidden': searchOptions.searchTranslate === 'none',
                'sm:hidden': searchOptions.searchLanguage !== 'all',
              }"
            >
              <span class="hidden sm:inline">
                ({{
                  entryData.lang
                    .map((l: string) => $t(`global.lang.${l}`))
                    .join(", ")
                }})
              </span>
              <span class="sm:hidden">
                {{
                  entryData.lang
                    .map((l: string) => $t(`global.lang.${l}`))
                    .join(", ")
                }}
              </span>
            </div>
          </div>
          <div
            v-if="searchOptions.searchLanguage === 'all'"
            class="hidden px-2 sm:w-2/5 lg:block lg:max-w-[10rem]"
            :class="{ 'md:block': searchOptions.searchTranslate === 'none' }"
          >
            {{
              intersectUnique(
                languageOrder[$i18n.locale as LocalLangCode],
                entryData.lang
              )
                .map((l: string) => $t(`global.lang.${l}`))
                .join(", ")
            }}
          </div>
          <div
            v-if="searchOptions.searchTranslate !== 'none'"
            class="flex justify-between sm:w-1/2 sm:px-2"
            :class="{
              'text-right': langRtoL(searchOptions.searchTranslate),
              'lg:w-5/12': searchOptions.searchLanguage === 'all',
            }"
          >
            <b v-html="entryData.translate"></b>
            <div class="text-right font-light sm:hidden">
              {{ $t("global.lang." + searchOptions.searchTranslate) }}
            </div>
          </div>
        </div>
        <div class="max-w-[20em] lg:w-[20em] lg:pl-2">
          {{ $t("global.samling." + entryData.samling) }}
        </div>
      </section>
    </AppLink>
  </li>
</template>

<script setup lang="ts">
import { LangCode, LocalLangCode } from "../utils/vars-language";

const searchOptions = useSearchOptions();
interface Props {
  entryData: {
    link: string;
    predicate: string;
    label: string;
    lang: string[];
    samling: string;
    translate?: string;
  };
}

const props = defineProps<Props>();
</script>

<style scoped>
li {
  margin-bottom: -1px;
  animation: show 200ms 0ms cubic-bezier(0.5, 0.1, 0.9, 0.8) forwards;
  opacity: 0;
}

@keyframes show {
  100% {
    opacity: 1;
    transform: none;
  }
}
</style>
