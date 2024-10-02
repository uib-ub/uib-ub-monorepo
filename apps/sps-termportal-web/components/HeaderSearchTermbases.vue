<template>
  <div ref="wrapper" class="w-full">
    <div class="flex gap-x-2 items-center flex-wrap gap-y-1">
      <!-- All termbases + expand -->
      <button
        v-if="searchInterface.termbase.length == 0"
        class="border py-1 px-3 rounded-md border-gray-300 min-h-[2.3em]"
        @click="panel = !panel"
      >
        {{ $t("global.samling.all") }}
      </button>

      <!-- Active termbases -->
      <button
        v-for="tb in searchInterface.termbase"
        :key="tb"
        class="flex justify-center items-center space-x-1.5 border py-1 pl-3 pr-2 rounded-md border-gray-300 min-h-[2.3em] group"
        @click="
          searchInterface.termbase = searchInterface.termbase.filter(
            (item) => item !== tb
          )
        "
      >
        <span>{{ lalof(`${tb}-3A${tb}`) }}</span>
        <Icon
          name="material-symbols:close"
          size="1.2rem"
          class="text-gray-600 mt-0.5 border border-white group-hover:border-gray-300 rounded-sm group-hover:bg-gray-100"
        />
      </button>
    </div>
    <div class="flex justify-center">
      <!-- Expand all termbases panel -->
      <button
        class="absolute border border-t-white border-gray-300 rounded-b-md bg-white h-[1.1em] mt-[6px] flex justify-center w-16"
        @click="panel = !panel"
      >
        <Icon
          name="mdi:chevron-down"
          size="1.6em"
          class="text-gray-600 mt-[-7px]"
          aria-hidden="true"
        />
      </button>
    </div>
    <div
      v-if="panel"
      class="absolute z-10 mt-[6px] rounded-b-[7px] border border-gray-300 bg-white border-t-white p-2 shadow-lg"
    >
      <div class="absolute top-0 right-0 flex mr-1 mt-1 space-x-2">
        <button
          v-if="searchInterface.termbase.length > 0"
          class="p-0.5 text-gray-600 border border-transparent rounded-sm hover:text-gray-800 hover:bg-gray-100 hover:border-gray-300"
          @click="searchInterface.termbase = []"
        >
          <IconReset class="text-lg" size="1.35em" />
          <span class="sr-only">Reset termbase options</span>
        </button>
        <button
          class="border hover:border-gray-300 border-transparent rounded-sm hover:bg-gray-100 text-gray-600 flex justify-center"
          @click="panel = false"
        >
          <IconClose class="text-lg" />
          <span class="sr-only">Close</span>
        </button>
      </div>
      <div class="text-lg px-2">
        {{ $t("global.termbase", 2) }}
      </div>
      <div
        class="grid grid-flow-row grid-cols-1 gap-x-8 gap-y-0 md:grid-cols-2"
      >
        <div v-for="tb of orderedTermbases" :key="tb" class="flex max-w-md">
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
  </div>
</template>
<script setup lang="ts">
const searchInterface = useSearchInterface();
const orderedTermbases = useOrderedTermbases();
const panel = ref();
const wrapper = ref(null);

onClickOutside(wrapper, () => (panel.value = false));
</script>

<style scoped>
input[type="checkbox"] {
  -webkit-appearance: none;
  appearance: none;
}
</style>
