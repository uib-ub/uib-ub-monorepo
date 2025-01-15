<template>
  <section v-if="displayData && displayAggData">
    <h2 class="text-xl">{{ $t("global.concept", 2) }}</h2>
    <div>
      <ol class="flex pb-2 pt-1.5 flex-wrap justify-center px-2">
        <li>
          <button
            class="px-1.5 py-0.5 text-lg hover:underline underline-offset-2"
            :class="{ 'underline font-semibold': query.char[0] === null }"
            @click="query.char = [null, 0]"
          >
            {{ $t("global.all") }}
          </button>
        </li>
        <li v-for="charEntry in displayAggData?.firstChar" :key="charEntry[0]">
          <button
            class="hover:underline underline-offset-2 text-lg px-[4px] py-0.5"
            :class="{
              'underline font-semibold': query.char[0] === charEntry[0],
            }"
            @click="query.char = charEntry"
          >
            {{ charEntry?.[0].toUpperCase() }}
          </button>
        </li>
      </ol>
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
          class="w-[20rem] xs:w-[27rem] sm:w-[17.5rem] md:w-[21.5rem] lg:w-[27rem] truncate"
        >
          <TermbaseConceptLink
            :concept="concept"
            :pending="pending"
          ></TermbaseConceptLink>
        </li>
      </ol>
    </div>
    <div>
      <Paginator
        v-model:first="query.page"
        :rows="breakpointDisplayConfig?.displayConcepts"
        :total-records="
          query.char[0] === null ? displayAggData.totalCount : query.char[1]
        "
        template="FirstPageLink PrevPageLink PageLinks NextPageLink"
      ></Paginator>
    </div>
  </section>
</template>

<script setup lang="ts">
const locale = useLocale();
const route = useRoute();
const router = useRouter();
const breakpoint = useBreakpoint();

const props = defineProps({
  termbaseId: { type: String, required: true },
});

const query = ref<{ char: [string | null, number]; page: number }>({
  char: [null, 0],
  page: 0,
});

// Set correct query props when navigating to tb page
// Needs to be before the watcher picks up changes
if (
  route.query.page &&
  typeof route.query.page === "string" &&
  parseInt(route.query.page) < 9000
) {
  query.value.page = parseInt(route.query.page);
}

if (route.query.char && typeof route.query.char === "string") {
  const value = route.query.char.split(",");
  query.value.char = [value[0], parseInt(value[1])];
}

watch(
  () => [query.value.page, query.value.char],
  (newValues, oldValues) => {
    const page = query.value.page || undefined;
    const char = query.value.char;
    router.push({
      query: {
        page: page?.toString(),
        char: char[0] ? `${char[0]},${char[1]}` : undefined,
      },
    });

    if (oldValues[0] === newValues[0]) {
      pushTermbaseConceptListNavigationEvent(props.termbaseId, "char", {
        page: query.value.page,
        char,
      });
      // Don't trigger event when going back or when reset is triggered automatically
    } else if (query.value.page !== 0) {
      pushTermbaseConceptListNavigationEvent(props.termbaseId, "page", {
        page: query.value.page,
        char,
      });
    }
  }
);

const generalConfig = {
  min: { columnCount: 1, columnLength: 20 },
  max: { columnCount: 2, columnLength: 15 },
};

const breakpointDisplayConfig = computed(() => {
  let configKey = "max";
  if (process.client) {
    configKey = ["min", "xs"].includes(breakpoint.value) ? "min" : "max";
  }

  const breakpointConfig: {
    numberLst: [number, number][];
    displayConcepts: number;
  } = { numberLst: [], displayConcepts: 0 };

  // calculate columns for concept list
  let startNumber = 0;
  for (let i = 0; i < generalConfig[configKey].columnCount; i++) {
    const endNumber = startNumber + generalConfig[configKey].columnLength;
    breakpointConfig.numberLst.push([startNumber, endNumber]);
    startNumber = endNumber;
  }

  // update how many concepts are displayed in one page
  breakpointConfig.displayConcepts =
    generalConfig[configKey].columnCount *
    generalConfig[configKey].columnLength;

  return breakpointConfig;
});

const breakpointFetchConfig = computed(() => {
  let configKey = "max";
  if (process.client) {
    configKey = ["min", "xs"].includes(breakpoint.value) ? "min" : "max";
  }

  const breakpointConfig: {
    fetchConcepts: number;
    sortOrder: "asc" | "desc";
    language: string;
    selectedChar: string | null;
    from: number;
  } = {
    fetchConcepts: 0,
    sortOrder: "asc",
    language: locale?.value,
    selectedChar: query.value.char?.[0] || null,
    from: query.value.page,
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
    body: breakpointFetchConfig,
  }
);

const displayData = computed(() => {
  return data.value?.map((concept) => {
    return {
      link: "/tb" + idOrUriToRoute(props.termbaseId, concept.id),
      label: concept?.displayLabel?.[locale.value]?.value,
      language: concept?.displayLabel?.[locale.value]?.language,
    };
  });
});
</script>
