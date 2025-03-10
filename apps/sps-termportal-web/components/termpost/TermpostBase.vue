<template>
  <div v-if="data">
    <Head v-if="mainp">
      <Title> {{ pagetitle }} | {{ $t("index.title") }} </Title>
    </Head>
    <div ref="termpostRef">
      <h2
        v-if="pagetitle"
        :id="mainp ? '#main' : `#${encodeURI(pagetitle)}`"
        class="mt-3 pb-0 md:mt-4 lg:mt-6 xl:pb-4"
      >
        <AppLink
          class="text-3xl"
          :to="mainp ? '#main' : `#${encodeURI(pagetitle)}`"
        >
          <span v-html="pagetitle"></span
        ></AppLink>
        <div
          v-if="mainConcept?.memberOf"
          class="h-8 text-lg text-gray-600 underline hover:text-black"
        >
          <client-only>
            <AppLink
              v-if="mainConcept.memberOf !== lalof(mainConcept.memberOf)"
              :to="'/tb/' + mainConcept?.memberOf.split('-3A')[1]"
            >
              {{ lalof(mainConcept.memberOf) }}
            </AppLink>
          </client-only>
        </div>
      </h2>
      <div class="space-y-5 lg:flex lg:space-y-0">
        <div class="lg:order-last lg:ml-2 xl:ml-5">
          <TermpostVisualizationSection
            v-if="displayInfo?.image && displayInfo?.image[0] && pagetitle"
            :display-info="displayInfo"
            :pagetitle="pagetitle"
          />
        </div>
        <div class="grid shrink-0 gap-y-3 lg:min-w-[30em] lg:shrink lg:gap-y-4">
          <div
            v-for="lang in displayInfo?.displayLanguages"
            :key="'disp_' + lang"
          >
            <TermpostLanguageSection
              :concept="mainConcept"
              :lang="lang"
              :meta="data?.meta"
            />
          </div>
          <TermpostSymbolSection
            v-if="displayInfo?.symbol && displayInfo?.symbol.length"
            :display-info="displayInfo"
          />
          <TermpostRelationSection
            v-if="displayInfo?.semanticRelations"
            :display-info="displayInfo"
          />
          <TermpostGeneralSection
            v-if="displayInfo && mainConcept"
            :concept="mainConcept"
            :display-info="displayInfo"
          />
        </div>
      </div>
    </div>
    <div v-if="error">Error</div>
  </div>
</template>

<script setup lang="ts">
const dataDisplayLanguages = useDataDisplayLanguages();
const localeLangOrder = useLocaleLangOrder();

const termpostRef = ref(null);

const props = defineProps({
  // used to fetch data
  conceptUrl: { type: String, required: true },
  // used to identify main concept in fetched data
  mainConceptId: { type: String, required: true },
  // toggle if concept should be used to set head title and skiplink target
  mainp: { type: Boolean, default: false },
});

watch(
  termpostRef,
  () => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise();
    }
  },
  { immediate: true }
);

const controller = new AbortController();
const timer = setTimeout(() => {
  controller.abort();
}, 6000);

const { data, error } = await useLazyAsyncData(
  "concept" + props.conceptUrl,
  () =>
    $fetch(`/api/concept/${props.conceptUrl}`, {
      method: "GET",
      headers: process.server
        ? { cookie: "session=" + useRuntimeConfig().apiKey }
        : undefined,
      retry: 1,
      signal: controller.signal,
    }).then((value) => {
      clearTimeout(timer);
      return value;
    })
);

const mainConcept = computed(() => {
  return data.value?.concept[props.mainConceptId];
});

const pagetitle = computed(() => {
  if (mainConcept.value) {
    return getConceptDisplaytitle(
      mainConcept.value,
      localeLangOrder.value.slice(0, 3)
    );
  } else {
    return "";
  }
});

const displayInfo = computed(() => {
  if (data.value?.meta) {
    const conceptLanguages = data.value.meta?.language;
    const displayLanguages = dataDisplayLanguages.value.filter((language) =>
      Array.from(conceptLanguages).includes(language)
    );
    const info = {
      conceptLanguages,
      displayLanguages,
      altLabelLength: data.value.meta?.maxLen.altLabel,
      hiddenLabelLength: data.value.meta?.maxLen.hiddenLabel,
    };
    // semantic relations
    for (const relationType of Object.keys(semanticRelationTypes)) {
      const relData = getRelationData(
        data.value?.concept,
        props.mainConceptId,
        relationType,
        localeLangOrder.value.slice(0, 3)
      );
      if (relData) {
        if (info.semanticRelations) {
          info.semanticRelations[relationType] = relData;
        } else {
          info.semanticRelations = {};
          info.semanticRelations[relationType] = relData;
        }
      }
    }
    // subjects
    if (data.value.concept?.[props.mainConceptId]?.subject) {
      const subj = mainConcept.value.subject;
      let subjectlist;
      if (typeof subj[0] === "string") {
        subjectlist = subj;
      } else {
        subjectlist = subj.map((subj) => {
          return subj["@value"];
        });
      }
      info.subject = subjectlist.join(", ");
    }

    // notation: symbols and images
    if (mainConcept.value?.notation) {
      const notation = mainConcept.value?.notation;
      info.symbol = notation.filter((notation) =>
        notation?.type.includes("skosxl:Label")
      );
      info.image = notation.filter((notation) =>
        notation?.type.includes(
          "http://wiki.terminologi.no/index.php/Special:URIResolver/Category-3ADct-3AImage"
        )
      );
    }
    info.pagetitle = pagetitle;

    return info;
  } else {
    return null;
  }
});

onBeforeUnmount(() => {
  clearTimeout(timer);
  if (!data.value?.[props.mainConceptId] && !controller.signal.aborted) {
    controller.abort();
  }
});
</script>
