<template>
  <div
    ref="wrapper"
    class="w-full"
  >
    <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
      <!-- All termbases + expand -->
      <button
        v-if="searchInterface.termbase.length == 0"
        class="min-h-[2.3em] rounded-md border border-gray-300 px-3 py-1"
        @click="panel = !panel"
      >
        {{ $t("global.samling.all") }}
      </button>

      <!-- Active termbases -->
      <button
        v-for="tb in searchInterface.termbase"
        :key="tb"
        class="group flex min-h-[2.3em] items-center justify-center space-x-1.5 rounded-md border border-gray-300 py-1 pl-3 pr-2"
        @click="
          searchInterface.termbase = searchInterface.termbase.filter(
            (item) => item !== tb,
          )
        "
      >
        <span>{{ getLaLo(`${tb}-3A${tb}`) }}</span>
        <Icon
          name="material-symbols:close"
          size="1.2rem"
          class="mt-0.5 rounded-sm border border-white text-gray-600 group-hover:border-gray-300 group-hover:bg-gray-100"
        />
      </button>
    </div>
    <div class="flex justify-center">
      <!-- Expand all termbases panel -->
      <button
        class="absolute mt-[6px] flex h-[1.1em] w-16 justify-center rounded-b-md border-2 border-gray-200 border-t-white bg-white"
        @click="panel = !panel"
      >
        <Icon
          name="mdi:chevron-down"
          size="1.6em"
          class="mt-[-7px] text-gray-600"
          aria-hidden="true"
        />
        <span class="sr-only">{{ $t("searchBar.expandTermbaseMenu") }}</span>
      </button>
    </div>
    <div
      v-if="panel"
      class="absolute z-20 mt-[6px] rounded-b-[7px] border border-gray-300 border-t-white bg-white p-2 shadow-lg"
    >
      <div class="absolute right-0 top-0 mr-1 mt-1 flex space-x-2">
        <button
          v-if="searchInterface.termbase.length > 0"
          class="rounded-sm border border-transparent p-0.5 text-gray-600 hover:border-gray-300 hover:bg-gray-100 hover:text-gray-800"
          @click="searchInterface.termbase = []"
        >
          <IconReset
            class="text-lg"
            size="1.35em"
          />
          <span class="sr-only">{{
            $t("searchBar.resetTermbaseOptions")
          }}</span>
        </button>
        <button
          class="flex justify-center rounded-sm border border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-100"
          @click="panel = false"
        >
          <IconClose class="text-lg" />
          <span class="sr-only">{{ $t("searchBar.closeTermbaseMenu") }}</span>
        </button>
      </div>
      <div class="px-2 text-lg">
        {{ $t("global.termbase", 2) }}
      </div>
      <div
        class="grid grid-flow-row grid-cols-1 grid-rows-15 gap-x-2 gap-y-0 lg:grid-flow-col"
      >
        <div
          v-for="tb of orderedTermbases"
          :key="tb"
          class="flex max-w-md"
        >
          <input
            :id="tb"
            v-model="searchInterface.termbase"
            :value="tb"
            type="checkbox"
            class="peer outline-none"
          >
          <label
            :for="tb"
            class="tp-transition-shadow flex w-fit cursor-pointer rounded-[7px] border border-transparent px-2 py-1 group-hover:border-tpblue-300 peer-focus:border-tpblue-300 peer-focus:shadow-tphalo"
            :class="{
              'bg-tpblue-400 text-white': Object.keys(
                searchInterface.termbase,
              ).includes(tb),
            }"
          >
            <div class="-mt-px w-6">
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
              {{ getLaLo(`${tb}-3A${tb}`) }}
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
const { getLaLo } = useLazyLocale();

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
