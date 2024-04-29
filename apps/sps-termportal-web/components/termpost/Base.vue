<template>
  <div class="lg:flex lg:space-x-6 space-y-5 lg:space-y-0">
    <div class="grid gap-y-5 shrink-0">
      <div v-for="lang in displayInfo?.displayLanguages" :key="'disp_' + lang">
        <TermpostLanguageSection
          :concept="concept"
          :lang="lang"
          :meta="data?.meta"
        />
      </div>
      <TermpostSymbolSection
        v-if="displayInfo?.symbol"
        :display-info="displayInfo"
      />
      <TermpostRelationSection
        v-if="displayInfo?.semanticRelations"
        :display-info="displayInfo"
      />
      <TermpostGeneralSection
        v-if="displayInfo && concept"
        :concept="concept"
        :display-info="displayInfo"
      />
    </div>
    <div>
      <TermpostVisualizationSection
        v-if="displayInfo?.image"
        :display-info="displayInfo"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
if (process.client) {
  useHead({
    script: [
      {
        src: "/mathjax-config.js",
        type: "text/javascript",
        defer: true,
      },
      {
        id: "MathJax-script",
        type: "text/javascript",
        src: "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js",
        defer: true,
      },
    ],
  });
}

const dataDisplayLanguages = useDataDisplayLanguages();
const locale = useLocale();

const props = defineProps({
  data: { type: Object, required: true },
  mainConceptId: { type: String, required: true },
});

const concept = computed(() => {
  return props.data.concept[props.mainConceptId];
});

const displayInfo = computed(() => {
  if (props.data?.meta) {
    const conceptLanguages = props.data.meta?.language;
    const displayLanguages = dataDisplayLanguages.value.filter((language) =>
      Array.from(conceptLanguages).includes(language)
    );
    const info = {
      conceptLanguages,
      displayLanguages,
      altLabelLength: props.data?.meta.maxLen.altLabel,
      hiddenLabelLength: props.data?.meta.maxLen.hiddenLabel,
    };
    // semantic relations
    for (const relationType of Object.keys(semanticRelationTypes)) {
      const relData = getRelationData(
        props.data?.concept,
        props.mainConceptId,
        relationType
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
    if (props.data.concept?.[props.mainConceptId]?.subject) {
      const subj = props.data.concept[props.mainConceptId].subject;
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
    if (props.data.concept?.[props.mainConceptId]?.notation) {
      const notation = props.data.concept?.[props.mainConceptId]?.notation;
      info.symbol = notation.filter((notation) =>
        notation?.type.includes("skosxl:Label")
      );
      info.image = notation.filter((notation) =>
        notation?.type.includes(
          "http://wiki.terminologi.no/index.php/Special:URIResolver/Category-3ADct-3AImage"
        )
      );
    }

    return info;
  } else {
    return null;
  }
});

onMounted(() => {
  if (typeof window?.MathJax !== "undefined") {
    window.MathJax.typesetPromise();
  }
});
</script>
