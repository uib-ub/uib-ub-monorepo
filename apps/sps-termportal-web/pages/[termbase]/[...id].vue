<template>
  <div class="flex h-full">
    <Head>
      <Title> {{ pagetitle }} | {{ $t("index.title") }} </Title>
    </Head>
    <h1 class="sr-only">{{ $t("id.topheading") }}</h1>
    <div class="flex">
      <SideBar />
      <div class="flex">
        <div
          v-if="searchData.length > 0"
          class="hidden max-w-[22em] shrink-0 flex-col md:flex md:w-[28vw] lg:w-[22vw] xl:w-[18vw]"
        >
          <BackToSearch />
          <nav aria-labelledby="sidebarresults">
            <h2 id="sidebarresults" class="pb-2 pt-3 text-2xl">
              {{ $t("searchFilter.results-heading") }}
            </h2>
            <ol ref="sidebar" class="overflow-y-auto" style="height: 0px">
              <SearchResultListEntryShort
                v-for="entry in searchData"
                :key="entry.label + entry.link + entry.lang"
                :entry-data="entry"
              />
            </ol>
          </nav>
        </div>
        <div
          class="flex grow flex-col lg:w-3/4"
          :class="{ 'pl-3 lg:pl-6': searchData.length > 0 }"
        >
          <main ref="main" class="h-full">
            <h2 id="main" class="pb-4">
              <AppLink class="text-3xl" to="#main">{{ pagetitle }}</AppLink>
              <div v-if="concept?.memberOf">
                <AppLink
                  class="text-lg text-gray-600 underline hover:text-black"
                  :to="'/' + concept?.memberOf.split('-3A')[1]"
                >
                  {{ lalo[locale][concept.memberOf] }}
                </AppLink>
              </div>
            </h2>
            <div class="grid gap-y-5">
              <div
                v-for="lang in displayInfo?.displayLanguages"
                :key="'disp_' + lang"
              >
                <h3 :id="lang" class="pb-1 text-xl">
                  <AppLink :to="`#${lang}`">{{
                    $t("global.lang." + lang)
                  }}</AppLink>
                </h3>
                <TermSection>
                  <!--Definition-->
                  <TermProp
                    v-if="
                      concept?.definisjon?.[lang] ||
                      concept?.betydningsbeskrivelse?.[lang]
                    "
                    :label="$t('id.definisjon')"
                  >
                    <TermDescription
                      :data="
                        concept.definisjon?.[lang] ||
                        concept?.betydningsbeskrivelse?.[lang]
                      "
                      prop="definition"
                      :data-lang="lang"
                    >
                    </TermDescription>
                  </TermProp>

                  <!--Anbefalt term-->
                  <TermProp
                    v-if="concept?.prefLabel?.[lang]"
                    :label="$t('id.prefLabel')"
                  >
                    <TermDescription
                      prop="prefLabel"
                      :data="concept?.prefLabel[lang]"
                      :data-lang="lang"
                    >
                    </TermDescription>
                  </TermProp>

                  <!--Tillatt term-->
                  <TermProp
                    v-if="concept?.altLabel?.[lang]"
                    :label="$t('id.altLabel')"
                  >
                    <TermDescription
                      prop="altLabel"
                      :data="concept?.altLabel[lang]"
                      :data-lang="lang"
                    >
                    </TermDescription>
                  </TermProp>
                  <!--Frarådet term-->
                  <TermProp
                    v-if="concept?.hiddenLabel?.[lang]"
                    :label="$t('id.hiddenLabel')"
                  >
                    <TermDescription
                      prop="altLabel"
                      :data="concept?.hiddenLabel[lang]"
                      :data-lang="lang"
                    >
                    </TermDescription>
                  </TermProp>
                  <!--Symbol-->
                  <!--Kontekst-->
                  <TermProp
                    v-if="concept?.hasUsage?.[lang]"
                    :label="$t('id.kontekst')"
                  >
                    <TermDescription
                      prop="context"
                      :data="concept?.hasUsage[lang]"
                      :data-lang="lang"
                    />
                  </TermProp>
                </TermSection>
              </div>
              <div v-if="displayInfo?.semanticRelations">
                <h3 id="relasjon" class="pb-1 text-xl">
                  <AppLink to="#relasjon"> {{ $t("id.relasjon") }}</AppLink>
                </h3>
                <TermSection>
                  <template v-for="relationType in semanticRelationTypes">
                    <TermProp
                      v-if="displayInfo.semanticRelations[relationType]"
                      :key="relationType"
                      :label="$t('id.' + relationType)"
                    >
                      <TermDescription
                        prop="link"
                        :data="displayInfo.semanticRelations[relationType]"
                      />
                    </TermProp>
                  </template>
                </TermSection>
              </div>
              <div>
                <h3 v-if="data" id="felles" class="pb-1 text-xl">
                  <AppLink to="#felles"> {{ $t("id.general") }}</AppLink>
                </h3>
                <TermSection :flex="true">
                  <TermProp
                    v-if="lalo[locale][concept?.memberOf]"
                    :flex="true"
                    :label="$t('id.collection')"
                  >
                    <TermDescription
                      prop="link"
                      :flex="true"
                      :data="[[lalo[locale][concept.memberOf], '/' + termbase]]"
                    />
                  </TermProp>
                  <TermProp
                    v-if="concept?.domene"
                    :flex="true"
                    :label="$t('id.domain')"
                  >
                    <TermDescription
                      :flex="true"
                      :data="[lalo[locale][concept.domene]]"
                    />
                  </TermProp>
                  <TermProp
                    v-if="displayInfo?.subject"
                    :flex="true"
                    :label="$t('id.subject')"
                  >
                    <TermDescription
                      :flex="true"
                      :data="[displayInfo?.subject]"
                    />
                  </TermProp>
                  <TermProp
                    v-if="concept?.modified"
                    :flex="true"
                    :label="$t('id.modified')"
                  >
                    <TermDescription :flex="true" :data="[modified()]" />
                  </TermProp>
                  <TermProp
                    v-if="concept?.scopeNote"
                    :flex="true"
                    :label="$t('id.note')"
                  >
                    <TermDescription
                      :flex="true"
                      :data="[concept.scopeNote?.label?.['@value'] || concept.scopeNote['@value']]"
                      :data-lang="concept.scopeNote?.label?.['@language'] || concept.scopeNote['@language']"
                    />
                  </TermProp>
                  <TermProp
                    v-if="
                      (route.params.termbase === 'NOT' ||
                        route.params.termbase === 'RTT') &&
                      concept
                    "
                    :flex="true"
                    :label="$t('id.note')"
                  >
                    <TermDescription
                      :flex="true"
                      :data="[$t('id.noteTermbaseIsUnmaintained')]"
                    />
                  </TermProp>
                </TermSection>
              </div>
            </div>
            <div v-if="error" class="p">Error</div>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Samling } from "~~/utils/vars-termbase";

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

const runtimeConfig = useRuntimeConfig();
const route = useRoute();
const searchScrollBarPos = useSearchScrollBarPos();
const dataDisplayLanguages = useDataDisplayLanguages();
const conceptViewToggle = useConceptViewToggle();
const searchData = useSearchData();
const lalo = useLazyLocales();
const locale = useLocale();
const sidebar = ref(null);
const main = ref(null);
const termbase = route.params.termbase as Samling;
const idArray = route.params.id as Array<string>;

onMounted(() => {
  if (sidebar.value) {
    sidebar.value.scrollTop = searchScrollBarPos.value;
  }
});

let base: string;
let id: string;
let procId: string;
if (!Object.keys(termbaseUriPatterns).includes(termbase)) {
  base = runtimeConfig.public.base;
  id = `${termbase}-3A${idArray[0]}`;
  procId = id;
} else {
  base = termbaseUriPatterns[termbase][idArray[0]];
  id = idArray.slice(1).join("/");
  procId = base + id;
}

const controller = new AbortController();
const timer = setTimeout(() => {
  controller.abort();
}, 6000);

const { data, error } = await useAsyncData("concept", () =>
  $fetch(`/api/concept`, {
    method: "POST",
    headers: process.server
      ? { cookie: "session=" + useRuntimeConfig().apiKey }
      : undefined,
    body: { concept: id, base, termbase },
    retry: 1,
    signal: controller.signal,
  }).then((value) => {
    clearTimeout(timer);
    return value;
  })
);

const concept = computed(() => {
  return data.value?.concept[procId];
});

const pagetitle = computed(() => {
  if (concept.value) {
    return getConceptDisplaytitle(concept.value);
  }
});

const modified = () => {
  try {
    const date = new Date(concept.value.modified["@value"]).toLocaleDateString(
      locale.value
    );
    const time = new Date(concept.value.modified["@value"]).toLocaleTimeString(
      locale.value
    );
    return date + ", " + time;
  } catch (e  ) {
    return undefined;
  }
};

const displayInfo = computed(() => {
  if (data?.value?.meta) {
    const conceptLanguages = data.value?.meta?.language;
    const displayLanguages = dataDisplayLanguages.value.filter((language) =>
      Array.from(conceptLanguages).includes(language)
    );
    const info = {
      conceptLanguages,
      displayLanguages,
      altLabelLength: data.value.meta.maxLen.altLabel,
      hiddenLabelLength: data.value.meta.maxLen.hiddenLabel,
    };

    for (const relationType of semanticRelationTypes) {
      const relData = getRelationData(data.value.concept, procId, relationType);
      if (relData) {
        if (info.semanticRelations) {
          info.semanticRelations[relationType] = relData;
        } else {
          info.semanticRelations = {};
          info.semanticRelations[relationType] = relData;
        }
      }
    }
    if (data.value?.concept?.[procId]?.subject) {
      const subj = data.value?.concept[procId].subject;
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

    return info;
  } else {
    return null;
  }
});

useResizeObserver(main, (e) => {
  if (sidebar.value) {
    sidebar.value.style.height = `${main.value.offsetHeight - 88}px`;
  }
});

onBeforeUnmount(() => {
  clearTimeout(timer);
  if (!data.value[procId] && !controller.signal.aborted) {
    controller.abort();
  }
  if (sidebar.value) {
    searchScrollBarPos.value = sidebar.value.scrollTop;
  }
});
onMounted(() => {
  if (typeof window?.MathJax !== "undefined") {
    window.MathJax.typesetPromise();
  }
});
</script>
