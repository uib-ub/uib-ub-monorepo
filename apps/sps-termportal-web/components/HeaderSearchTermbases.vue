<template>
  <div ref="wrapper">
    <button
      class="tp-transition-shadow group flex h-full items-center rounded-[7px] border border-gray-300 px-2 outline-none focus:border-tpblue-300 focus:shadow-tphalo"
      @click="panel = !panel"
    >
      <div
        class="... max-w-[11em] flex-nowrap truncate px-1.5 xs:max-w-[18em] sm:max-w-[26.5em] md:max-w-[36em] lg:max-w-[41.4em]"
      >
        {{ termbaseLabel }}
      </div>
      <Icon
        name="mdi:chevron-down"
        size="1.6em"
        class="mb-[-4px] mr-[-8px] text-gray-600 group-hover:text-gray-900"
        aria-hidden="true"
      />
    </button>
    <div
      v-if="panel"
      class="absolute z-10 grid grid-flow-row grid-cols-1 gap-x-8 gap-y-0 rounded-[7px] border border-gray-300 bg-white p-2 shadow-md md:grid-cols-2"
    >
      <button
        class="absolute top-0 right-0 border hover:border-gray-300 border-transparent rounded-sm hover:bg-gray-100 text-gray-600 mr-1 mt-1 flex justify-center"
        @click="panel = false"
      >
        <Icon name="material-symbols:close" size="1.4rem" />
      </button>
      <div v-for="tb of termbaseOrder" :key="tb" class="flex">
        <input
          :id="tb"
          v-model="searchInterface.termbase"
          :value="tb"
          type="checkbox"
          class="peer outline-none"
        />
        <label
          :for="tb"
          class="tp-transition-shadow flex w-fit cursor-pointer rounded-[7px] border border-transparent px-2 py-1 group-hover:border-tpblue-300 peer-focus:border-tpblue-300 peer-focus:shadow-tphalo"
          :class="{
            'bg-tpblue-400 text-white': Object.keys(
              searchInterface.termbase
            ).includes(tb),
          }"
        >
          <div class="-mt-[1px] w-6">
            <Icon
              v-if="searchInterface.termbase.includes(tb)"
              name="mdi:checkbox-marked-outline"
              size="1.4em"
              class="text-tpblue-400"
              aria-hidden="true"
            />
            <Icon
              v-else
              name="mdi:checkbox-blank-outline"
              size="1.4em"
              class="text-tpblue-400"
              aria-hidden="true"
            />
          </div>
          <div class="flex-wrap pl-1.5">
            {{ lalof(`${tb}-3A${tb}`) }}
          </div>
        </label>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useI18n } from "vue-i18n";

const searchInterface = useSearchInterface();
const i18n = useI18n();
const panel = ref();
const wrapper = ref(null);

const termbaseLabel = computed(() => {
  const tbs = searchInterface.value.termbase;
  if (tbs.length === 0) {
    return i18n.t("global.samling.all");
  } else if (tbs.length === 1) {
    return lalof(`${tbs[0]}-3A${tbs[0]}`);
  } else {
    const tbvals = tbs
      .map((tb) => {
        return lalof(`${tb}-3A${tb}`);
      })
      .join(", ");
    return `${tbs.length} ${i18n.t("global.termbase", 4)}: ${tbvals}`;
  }
});

onClickOutside(wrapper, () => (panel.value = false));
</script>

<style scoped>
input[type="checkbox"] {
  -webkit-appearance: none;
  appearance: none;
}
</style>
