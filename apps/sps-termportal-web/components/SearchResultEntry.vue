<template>
  <tr class="hover:bg-gray-100">
    <td
      class="py-1 pr-2"
      :class="{ 'text-right': langRtoL(entryData.lang[0] as LangCode) }"
    >
      <AppLink class="" :to="`/${entryData.link}`">
        <b
          v-if="entryData.predicate == 'prefLabel'"
          v-html="entryData.label"
        ></b>
        <span v-else v-html="entryData.label"></span>
      </AppLink>
    </td>
    <td v-if="searchOptions.searchLanguage === 'all'" class="px-2">
      <AppLink class="" :to="`/${entryData.link}`">
        {{
          entryData.lang.map((l: string) => $t(`global.lang.${l}`)).join(", ")
        }}
      </AppLink>
    </td>
    <td
      v-if="searchOptions.searchTranslate !== 'none'"
      class="px-2"
      :class="{ 'text-right': langRtoL(searchOptions.searchTranslate) }"
    >
      <b v-html="entryData.translate"></b>
    </td>
    <td class="pl-2">
      {{ $t("global.samling." + entryData.samling) }}
    </td>
  </tr>
</template>

<script setup lang="ts">
import { LangCode } from "../utils/vars-language";

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
