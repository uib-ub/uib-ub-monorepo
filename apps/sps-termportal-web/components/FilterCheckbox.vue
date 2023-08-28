<template>
  <div class="space-x-3">
    <input
      :id="`filter-${ftype}-${fvalue}`"
      v-model="searchFilterData[ftype as keyof SearchDataStats]"
      class="cursor-pointer"
      type="checkbox"
      :value="fvalue"
    />
    <label class="cursor-pointer" :for="`filter-${ftype}-${fvalue}`"
      >{{ label() }} ({{
        searchDataStats[ftype as keyof SearchDataStats][
          fvalue as LangCode | Samling | Matching | LabelPredicate
        ]
      }})</label
    >
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { SearchDataStats } from "~~/composables/states";
import { Matching, LabelPredicate } from "~~/utils/vars";
import { LangCode } from "~/composables/locale";
import { Samling } from "~~/utils/vars-termbase";

const i18n = useI18n();
const searchFilterData = useSearchFilterData();
const searchDataStats = useSearchDataStats();
const locale = useLocale();
const lalo = useLazyLocales();
const props = defineProps({
  ftype: { type: String, required: true },
  fvalue: { type: String, required: true },
});

const label = () => {
  if (props.ftype === "context") {
    return lalo.value[locale.value][props.fvalue];
  } else {
    return i18n.t(`global.${props.ftype}.${props.fvalue}`);
  }
};
</script>
