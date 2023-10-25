<template>
  <div class="group flex">
    <input
      :id="`filter-${ftype}-${fvalue}`"
      v-model="searchFilterData[ftype as keyof SearchDataStats]"
      class="peer cursor-pointer outline-none"
      type="checkbox"
      :value="fvalue"
    />
    <label
      class="tp-transition-shadow flex cursor-pointer gap-x-1.5 rounded-[7px] border border-transparent px-1.5 py-0.5 group-hover:border-tpblue-300 peer-focus:border-tpblue-300 peer-focus:shadow-tphalo"
      :for="`filter-${ftype}-${fvalue}`"
    >
      <div class="-mt-[1px]">
        <Icon
          v-if="searchFilterData[ftype].includes(fvalue)"
          name="mdi:checkbox-marked-outline"
          size="1.3em"
          class="text-tpblue-400"
          aria-hidden="true"
        />
        <Icon
          v-else
          name="mdi:checkbox-blank-outline"
          size="1.3em"
          class="text-tpblue-400"
          aria-hidden="true"
        />
      </div>
      <div>
        {{ label() }} ({{
          searchDataStats[ftype as keyof SearchDataStats][
            fvalue as LangCode | Samling | Matching | LabelPredicate
          ]
        }})
      </div>
    </label>
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
const props = defineProps({
  ftype: { type: String, required: true },
  fvalue: { type: String, required: true },
});

const label = () => {
  if (props.ftype === "context") {
    return lalof(props.fvalue);
  } else {
    return i18n.t(`global.${props.ftype}.${props.fvalue}`);
  }
};
</script>

<style scoped>
input[type="radio"] {
  -webkit-appearance: none;
  appearance: none;
}

input[type="checkbox"] {
  -webkit-appearance: none;
  appearance: none;
}
</style>
