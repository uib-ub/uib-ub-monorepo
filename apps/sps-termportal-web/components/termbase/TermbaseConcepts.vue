<template>
  <section v-if="displayData && displayAggData" class="">
    <h2 class="text-xl">{{ $t("global.concept", 2) }}</h2>
    <div class="flex justify-evenly">
      <ol class="flex pb-2 pt-1.5 flex-wrap justify-center px-2">
        <li>
          <button
            class="px-1.5 py-0.5 text-lg hover:underline underline-offset-2"
            :class="{ 'underline font-semibold': selectedChar === null }"
            @click="selectedChar = null"
          >
            {{ $t("global.all") }}
          </button>
        </li>
        <li v-for="[key] in displayAggData?.firstChar" :key="key">
          <button
            class="hover:underline underline-offset-2 text-lg px-[4px] py-0.5"
            :class="{ 'underline font-semibold': selectedChar === key }"
            @click="selectedChar = key"
          >
            {{ key.toUpperCase() }}
          </button>
        </li>
      </ol>
      <div></div>
    </div>
    <div class="flex space-x-12 justify-strech px-3 sm:px-1.5 md:px-0">
      <ol
        v-for="col in breakpointDisplayConfig.numberLst"
        :key="col[0] + col[1]"
        class="space-y-1.5"
      >
        <li
          v-for="concept in displayData.slice(col[0], col[1])"
          :key="concept.link"
          class="w-[17rem] xs:w-[26rem] sm:w-[17rem] md:w-[22.5rem] lg:w-[25rem]"
        >
          <TermbaseConceptLink
            :concept="concept"
            :pending="pending"
          ></TermbaseConceptLink>
        </li>
      </ol>
    </div>
  </section>
</template>

<script setup lang="ts">
const locale = useLocale();
const breakpoint = useBreakpoint();

const props = defineProps({
  termbaseId: { type: String, required: true },
});

const selectedChar: Ref<string | null> = ref(null);

const generalConfig = {
  min: { columnCount: 1, columnLength: 20 },
  max: { columnCount: 2, columnLength: 15 },
};

const breakpointDisplayConfig = computed(() => {
  const configKey = ["min", "xs"].includes(breakpoint.value) ? "min" : "max";

  const breakpointConfig: {
    numberLst: [number, number][];
  } = { numberLst: [] };

  // calculate columns for concept list
  let startNumber = 0;
  for (let i = 0; i < generalConfig[configKey].columnCount; i++) {
    const endNumber = startNumber + generalConfig[configKey].columnLength;
    breakpointConfig.numberLst.push([startNumber, endNumber]);
    startNumber = endNumber;
  }

  return breakpointConfig;
});

const breakPointFetchConfig = computed(() => {
  const configKey = ["min", "xs"].includes(breakpoint.value) ? "min" : "max";

  const breakpointConfig: {
    fetchConcepts: number;
    sortOrder: "asc" | "desc";
    language: string;
    selectedChar: string | null;
    from: number;
  } = {
    fetchConcepts: 40,
    sortOrder: "asc",
    language: locale?.value,
    selectedChar: selectedChar?.value,
    from: 0,
  };

  // calculate number of concepts to fetch
  breakpointConfig.fetchConcepts =
    generalConfig[configKey].columnCount *
    generalConfig[configKey].columnLength;

  return breakpointConfig;
});

const { data: conceptsAggData } = await useLazyFetch(
  `/api/termbase/${props.termbaseId.toLowerCase()}/aggConcepts`,
  {
    method: "POST",
    body: { language: locale },
  }
);

const displayAggData = computed(() => {
  return {
    totalCount: conceptsAggData.value?.total_count.value,
    firstChar: conceptsAggData.value?.unique_values.buckets.map((bucket) => [
      bucket.key,
      bucket.doc_count,
    ]),
  };
});
const { data, pending } = await useLazyFetch(
  `/api/termbase/${props.termbaseId.toLowerCase()}/concepts`,
  {
    method: "POST",
    body: breakPointFetchConfig,
  }
);

const displayData = computed(() => {
  return data.value?.map((concept) => {
    return {
      link: idOrUriToRoute(props.termbaseId, concept.id),
      label: concept.displayLabel[locale.value]?.value,
      language: concept.displayLabel[locale.value]?.language,
    };
  });
});
</script>
