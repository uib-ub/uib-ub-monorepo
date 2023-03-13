<template>
  <tr class="hover:bg-gray-100">
    <td
      class="py-1"
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
  </tr>
</template>

<script setup lang="ts">
import { LangCode } from "../utils/vars-language";

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
