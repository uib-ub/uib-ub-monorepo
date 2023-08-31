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
          class="hidden flex-col md:flex md:w-60 lg:w-1/3"
        >
          <div class="flex h-9">
            <AppLink
              class="group flex items-center space-x-2 text-lg"
              to="/search"
            >
              <Icon
                name="ion:return-up-back-sharp"
                size="1.7em"
                aria-hidden="true"
                class="h-7 w-12 rounded bg-tpblue-400 text-white group-hover:bg-blue-700"
              ></Icon>
              <div class="group-hover:underline">
                {{ $t("id.tilbake") }}
              </div></AppLink
            >
          </div>
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
          class="flex flex-col lg:w-3/4"
          :class="{ 'pl-3 lg:pl-6': searchData.length > 0 }"
        >
          <div class="invisible h-9">
            <input
              id="viewToggle"
              v-model="conceptViewToggle"
              type="checkbox"
            />
            <label for="viewToggle">{{ $t("id.tableview") }}</label>
          </div>
          <main ref="main" class="h-full">
            <h2 id="main" class="pb-4">
              <AppLink class="text-3xl" to="#main">{{ pagetitle }}</AppLink>
              <div v-if="concept?.memberOf">
                <AppLink
                  class="text-lg text-gray-600 underline hover:text-black"
                  :to="'/' + concept?.memberOf.split('-3A')[1]"
                >
                  {{
                    $t("global.samling." + concept?.memberOf.split("-3A")[1])
                  }}
                </AppLink>
              </div>
            </h2>
            <div v-if="conceptViewToggle">
              <h3>{{ $t("id.languagedata") }}</h3>
              <table class="table-auto">
                <!--Header-->
                <thead>
                  <tr>
                    <th class="" scope=""></th>
                    <th
                      v-for="lang in displayInfo?.displayLanguages"
                      :key="'langSection_' + lang"
                      scope="col"
                    >
                      {{ $t("global.lang." + lang) }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <!--PrefLabel-->
                  <tr
                    v-for="(e, i) in displayInfo.prefLabelLength"
                    :key="'prefLabel_' + i"
                  >
                    <th scope="row">{{ $t("id.prefLabel") }}</th>
                    <td
                      v-for="lang in displayInfo?.displayLanguages"
                      :key="'prefLabel_' + lang + i"
                    >
                      {{
                        data[data[procId]?.prefLabel[lang]?.[i]]?.literalForm[
                          "@value"
                        ]
                      }}
                    </td>
                    <!--Kontekst?-->
                  </tr>
                  <!--AltLabel-->
                  <tr
                    v-for="(e, i) in displayInfo.altLabelLength"
                    :key="'altLabel_' + i"
                  >
                    <th scope="row">{{ $t("id.altLabel") }}</th>
                    <td
                      v-for="lang in displayInfo?.displayLanguages"
                      :key="'altLabel_' + lang + i"
                    >
                      {{
                        data[data[procId]?.altLabel[lang]?.[i]]?.literalForm[
                          "@value"
                        ]
                      }}
                    </td>
                  </tr>
                  <!--HiddenLabel-->
                  <tr
                    v-for="(e, i) in displayInfo.hiddenLabelLength"
                    :key="'hiddenLabel_' + i"
                  >
                    <th scope="row">{{ $t("id.hiddenLabel") }}</th>
                    <td
                      v-for="lang in displayInfo?.displayLanguages"
                      :key="'hiddenLabel' + lang + i"
                    >
                      {{
                        data[data[procId]?.hiddenLabel[lang]?.[i]]?.literalForm[
                          "@value"
                        ]
                      }}
                    </td>
                  </tr>
                  <!--Definisjon-->
                </tbody>
              </table>
            </div>
            <!--USED-->
            <div v-else class="grid gap-y-5">
              <div
                v-for="lang in displayInfo?.displayLanguages"
                :key="'disp_' + lang"
              >
                <h3 :id="lang" class="pb-1 text-xl">
                  <AppLink :to="`#${lang}`">{{
                    $t("global.lang." + lang)
                  }}</AppLink>
                </h3>
                <table class="table-auto">
                  <tbody>
                    <!--Definisjon-->
                    <DataRow
                      v-if="
                        concept?.definisjon?.[lang] ||
                        concept?.betydningsbeskrivelse?.[lang]
                      "
                      :key="'definisjon' + lang"
                      :data="
                        concept.definisjon?.[lang][0]?.label['@value'] ||
                        concept?.betydningsbeskrivelse?.[lang][0]?.label[
                          '@value'
                        ]
                      "
                      :label="$t('id.definisjon')"
                      :data-lang="lang"
                    />
                    <!--Anbefalt term-->
                    <DataRow
                      v-if="concept?.prefLabel?.[lang]"
                      :key="'prefLabel_' + lang"
                      :data="concept?.prefLabel[lang][0]?.literalForm['@value']"
                      :label="$t('id.prefLabel')"
                      :data-lang="lang"
                    />
                    <!--AltLabel-->
                    <DataRow
                      v-for="label in concept?.altLabel?.[lang]"
                      :key="'altLabel_' + label"
                      :data="label?.literalForm['@value']"
                      :label="$t('id.altLabel')"
                      :data-lang="lang"
                    />
                    <!--HiddenLabel-->
                    <DataRow
                      v-for="label in concept?.hiddenLabel?.[lang]"
                      :key="'hiddenLabel_' + label"
                      :data="label?.literalForm['@value']"
                      :label="$t('id.hiddenLabel')"
                      :data-lang="lang"
                    />
                  </tbody>
                </table>
              </div>
              <div v-if="displayInfo?.semanticRelations">
                <h3 id="relasjon" class="pb-1 text-xl">
                  <AppLink to="#relasjon"> {{ $t("id.relasjon") }}</AppLink>
                </h3>
                <table>
                  <tbody>
                    <template v-for="relationType in semanticRelationTypes">
                      <template
                        v-if="displayInfo.semanticRelations[relationType]"
                      >
                        <DataRow
                          v-for="relation in displayInfo.semanticRelations[
                            relationType
                          ]"
                          :key="relation"
                          :data="relation[0]"
                          :to="relation[1]"
                          :label="$t('id.' + relationType)"
                        />
                      </template>
                    </template>
                  </tbody>
                </table>
              </div>
              <div>
                <h3 v-if="data" id="felles" class="pb-1 text-xl">
                  <AppLink to="#felles"> {{ $t("id.general") }}</AppLink>
                </h3>
                <table>
                  <tbody>
                    <!--Termbase-->
                    <DataRow
                      v-if="concept?.memberOf"
                      :data="lalo[locale][concept.memberOf]"
                      :to="`/${termbase}`"
                      :label="$t('id.collection')"
                    />
                    <!--Domene-->
                    <DataRow
                      v-if="concept?.domene"
                      :data="lalo[locale][concept.domene]"
                      :label="$t('id.domain')"
                    />
                    <!--Bruksområde-->
                    <DataRow
                      v-if="displayInfo?.subject"
                      :data="displayInfo?.subject"
                      :label="$t('id.subject')"
                    />
                    <!--Modified-->
                    <DataRow
                      v-if="concept?.modified"
                      :data="concept.modified['@value']"
                      :label="$t('id.modified')"
                    />
                    <!--Created-->
                    <!--Note TODO after export fix-->
                    <DataRow
                      v-if="concept?.scopeNote"
                      :data="concept.scopeNote"
                      :label="$t('id.note')"
                    />
                    <!--Note for historical termbases-->
                    <DataRow
                      v-if="
                        route.params.termbase === 'NOT' ||
                        route.params.termbase === 'RTT'
                      "
                      :data="$t('id.noteTermbaseIsUnmaintained')"
                      :label="$t('id.note')"
                    />
                  </tbody>
                </table>
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
    sidebar.value.style.height = `${main.value.offsetHeight - 55}px`;
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
