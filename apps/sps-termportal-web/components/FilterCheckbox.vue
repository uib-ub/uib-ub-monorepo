<template>
  <div class="space-x-3 text-lg">
    <input
      :id="`filter-${ftype}-${fvalue}`"
      v-model="searchFilterData[ftype as keyof SearchDataStats]"
      class="cursor-pointer"
      type="checkbox"
      :value="fvalue"
    />
    <label class="cursor-pointer" :for="`filter-${ftype}-${fvalue}`"
      >{{ $t("global." + ftype + "." + fvalue) }} ({{
        searchDataStats[ftype as keyof SearchDataStats][
          fvalue as LangCode | Samling | Matching | LabelPredicate
        ]
      }})</label
    >
  </div>
</template>

<script setup lang="ts">
import { SearchDataStats } from "~~/composables/states";
import { Matching, LabelPredicate } from "~~/utils/vars";
import { LangCode } from "~/composables/locale";
import { Samling } from "~~/utils/vars-termbase";

const searchFilterData = useSearchFilterData();
const searchDataStats = useSearchDataStats();
const props = defineProps({
  ftype: { type: String, required: true },
  fvalue: { type: String, required: true },
});
</script>
