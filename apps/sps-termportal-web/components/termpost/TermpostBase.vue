<template>
  <div v-if="data">
    <Head v-if="mainp">
      <Title> {{ pagetitle }} | {{ $t("index.title") }} </Title>
    </Head>
    <div ref="termpostRef">
      <h2
        v-if="pagetitle"
        :id="mainp ? 'main' : `#${encodeURI(pagetitle)}`"
        class="mt-3 pb-0 md:mt-4 lg:mt-6 xl:pb-4"
      >
        <AppLink
          class="text-3xl"
          :to="mainp ? '#main' : `#${encodeURI(pagetitle)}`"
        >
          <span v-html="pagetitle" />
        </AppLink>
        <div
          v-if="mainConcept?.memberOf"
          class="h-8 text-lg text-gray-600 underline hover:text-black"
        >
          <client-only>
            <AppLink
              v-if="mainConcept.memberOf !== getLaLo(mainConcept.memberOf)"
              :to="'/tb/' + mainConcept?.memberOf.split('-3A')[1]"
            >
              {{ getLaLo(mainConcept.memberOf) }}
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
    <div v-if="error">
      Error
    </div>
  </div>
</template>

<script setup lang="ts">
const appConfig = useAppConfig();

const dataDisplayLanguages = useDataDisplayLanguages();
const localeLangOrder = useLocaleLangOrder();
const { getLaLo } = useLazyLocale();

const termpostRef = ref(null);

const props = defineProps({
  termbaseId: { type: String, required: true },
  conceptIdArray: { type: Array<string>, required: true },
  mainp: { type: Boolean, default: false },
});

function getConceptId(termbase: TermbaseId, idArray: string[]): string {
  const patternKey = idArray[0];
  let id: string;
  let mainConceptId: string;
  if (
    (appConfig.tb.base.specialUriTbs as readonly TermbaseId[]).includes(
      termbase,
    )
    && Object.keys(appConfig.tb).includes(termbase)
  ) {
    const tbId = termbase as SpecialUriTermbase & ConfiguredTermbase;

    if (Object.keys(appConfig.tb[tbId].uriPatterns).includes(patternKey)) {
      type PatternKey = keyof (typeof appConfig.tb)[typeof tbId]["uriPatterns"];

      const base = appConfig.tb[tbId].uriPatterns[patternKey as PatternKey];
      id = idArray.slice(1).join("/");
      mainConceptId = base + id;
    }
    else {
      id = `${termbase}-3A${idArray[0]}`;
      mainConceptId = id;
    }
  }
  else {
    id = `${termbase}-3A${idArray[0]}`;
    mainConceptId = id;
  }
  return mainConceptId;
}
const mainConceptId = getConceptId(props.termbaseId, props.conceptIdArray);

const controller = new AbortController();
const timer = setTimeout(() => {
  controller.abort();
}, 6000);

const { data, error } = await useLazyAsyncData("concept" + mainConceptId, () =>
  $fetch(
    `/api/termbase/${props.termbaseId}/${encodeURI(
      props.conceptIdArray.join("/"),
    )}`,
    {
      method: "GET",
      headers: import.meta.server
        ? { cookie: "session=" + useRuntimeConfig().apiKey }
        : undefined,
      retry: 1,
      signal: controller.signal,
    },
  ).then((value) => {
    clearTimeout(timer);
    return value;
  }),
);

const mainConcept = computed(() => {
  return data.value?.concept?.[mainConceptId];
});

const pagetitle = computed(() => {
  if (mainConcept.value) {
    return getConceptDisplaytitle(
      mainConcept.value,
      localeLangOrder.value.slice(0, 3),
    );
  }
  else {
    return "";
  }
});

const displayInfo = computed(() => {
  if (data.value?.meta) {
    const conceptLanguages = data.value.meta?.language;
    const displayLanguages = dataDisplayLanguages.value.filter(language =>
      Array.from(conceptLanguages).includes(language),
    );
    const info = {
      conceptLanguages,
      displayLanguages,
      altLabelLength: data.value.meta?.maxLen.altLabel,
      hiddenLabelLength: data.value.meta?.maxLen.hiddenLabel,
    };
    // semantic relations
    for (const relationType of Object.keys(
      appConfig.data.semanticRelations,
    ) as SemanticRelation[]) {
      const relData = getRelationData(
        data.value?.concept,
        mainConceptId,
        relationType,
        localeLangOrder.value.slice(0, 3),
      );
      if (relData) {
        if (!info.semanticRelations) {
          info.semanticRelations = {};
        }
        info.semanticRelations[relationType] = relData;
      }
    }
    // subjects
    if (data.value.concept?.[mainConceptId]?.subject) {
      const subj = mainConcept.value.subject;
      let subjectlist;
      if (typeof subj[0] === "string") {
        subjectlist = subj;
      }
      else {
        subjectlist = subj.map((subj) => {
          return subj["@value"];
        });
      }
      info.subject = subjectlist.join(", ");
    }

    // notation: symbols and images
    if (mainConcept.value?.notation) {
      const notation = mainConcept.value?.notation;
      info.symbol = notation.filter(notation =>
        notation?.type.includes("skosxl:Label"),
      );
      info.image = notation.filter(notation =>
        notation?.type.includes(
          "http://wiki.terminologi.no/index.php/Special:URIResolver/Category-3ADct-3AImage",
        ),
      );
    }
    info.pagetitle = pagetitle;

    return info;
  }
  else {
    return null;
  }
});

onBeforeUnmount(() => {
  clearTimeout(timer);
  if (!data.value?.[props.mainConceptId] && !controller.signal.aborted) {
    controller.abort();
  }
});

let isRendering = false;
let lastRenderedId = '';

const renderMathJax = async () => {
  if (isRendering || lastRenderedId === mainConceptId || !termpostRef.value) {
    return;
  }

  isRendering = true;
  try {
    // Load MathJax if needed
    if (!window.MathJax?.typesetPromise && window.MathJax?.options) {
      await new Promise<void>((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.head.appendChild(script);
      });
    }

    // Wait for MathJax to be ready and render
    if (window.MathJax?.startup?.promise) {
      await window.MathJax.startup.promise;
    }
    if (window.MathJax?.typesetPromise) {
      await window.MathJax.typesetPromise([termpostRef.value]);
      lastRenderedId = mainConceptId;
    }
  } catch (e) {
    console.error('MathJax render error:', e);
  } finally {
    isRendering = false;
  }
};

onMounted(async () => {
  // Wait for data to load
  let attempts = 0;
  while (!mainConcept.value && attempts < 30) {
    await new Promise(r => setTimeout(r, 100));
    attempts++;
  }
  await nextTick();
  await nextTick();
  await renderMathJax();
});

watch(() => props.termbaseId + props.conceptIdArray.join('/'), async () => {
  await nextTick();
  await nextTick();
  await new Promise(r => setTimeout(r, 500));
  await renderMathJax();
});
</script>
