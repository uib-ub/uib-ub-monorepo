<template>
  <div class="group flex">
    <input
      :id="`filter-${placement}-${ftype}-${fvalue}`"
      v-model="searchFilterSelection[ftype as keyof SearchDataStats]"
      class="peer cursor-pointer outline-none"
      type="checkbox"
      :value="fvalue"
      @change="useFetchSearchData(useGenSearchOptions('filter'))"
    />
    <label
      class="tp-transition-shadow flex cursor-pointer gap-x-2 rounded-[7px] border border-transparent px-1.5 py-0.5 group-hover:border-tpblue-300 peer-focus:border-tpblue-300 peer-focus:shadow-tphalo"
      :for="`filter-${placement}-${ftype}-${fvalue}`"
    >
      <div class="-mt-[2px]">
        <Icon
          v-if="searchFilterSelection[ftype].includes(fvalue)"
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
        {{ label() }}
        <span :class="{ 'text-gray-400': searchDataPending.aggregate }">
          ({{ searchDataStats[ftype][fvalue] }})
        </span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import type { SearchDataStats } from "~~/composables/states";

const i18n = useI18n();
const searchFilterSelection = useSearchFilterSelection();
const searchDataStats = useSearchDataStats();
const searchDataPending = useSearchDataPending();

const props = defineProps({
  ftype: { type: String, required: true },
  fvalue: { type: String, required: true },
  placement: { type: String, default: "default" },
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
