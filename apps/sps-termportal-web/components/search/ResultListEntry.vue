<template>
  <li>
    <AppLink :to="`${entryData.link}`">
      <section
        class="px-2 py-1.5 hover:bg-gray-200 lg:flex lg:py-2"
        :class="{
          'sm:flex': searchInterface.translate === 'none',
        }"
      >
        <div class="grow justify-between sm:flex">
          <div
            class="flex grow justify-between"
            :class="{
              'sm:justify-start': searchInterface.translate !== 'none',
              'text-right': langRtoL(entryData.lang[0] as LangCode),
              'sm:grow-0': searchInterface.translate !== 'none'
            }"
          >
            <SearchResultLabel
              :predicate="entryData.predicate"
              :label-data="entryData.label"
              :label-lang="entryData.lang"
            />
            <!-- Language information smaller screens-->
            <div
              class="pl-3 font-light lg:hidden"
              :class="{
                hidden:
                  searchInterface.translate === 'none' &&
                  searchInterface.language !== 'all',
                'md:hidden': searchInterface.translate === 'none',
                'sm:hidden':
                  searchInterface.language !== 'all' &&
                  searchInterface.language !== 'en',
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
          <!-- Language information larger screens -->
          <div
            v-if="
              ['all', 'en'].includes(searchInterface.language) ||
              entryData.lang.includes('en-gb') ||
              entryData.lang.includes('en-us')
            "
            class="hidden px-2 sm:w-2/5 lg:block lg:max-w-[10rem]"
            :class="{ 'md:block': searchInterface.translate === 'none' }"
          >
            {{
              intersectUnique(localeLangOrder, entryData.lang)
                .map((l: string) => $t(`global.lang.${l}`))
                .join(", ")
            }}
          </div>
          <!-- Target language information -->
          <div
            v-if="searchInterface.translate !== 'none'"
            class="flex justify-between sm:w-1/2 sm:px-2"
            :class="{
              'text-right': langRtoL(searchInterface.translate),
              'lg:w-5/12': searchInterface.language === 'all',
            }"
          >
            <span v-html="entryData.translate"></span>
            <div class="text-right font-light sm:hidden">
              {{ $t("global.lang." + searchInterface.translate) }}
            </div>
          </div>
        </div>
        <div class="max-w-[20em] lg:w-[20em] lg:pl-2">
          {{ lalof(entryData.context) }}
        </div>
      </section>
    </AppLink>
  </li>
</template>

<script setup lang="ts">
import type { LangCode } from "~/composables/locale";
const localeLangOrder = useLocaleLangOrder();

const searchInterface = useSearchInterface();
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
