<template>
  <div class="flex h-full" style="height: calc(100% - 128px)">
    <Head>
      <Title> {{ pagetitle }} | {{ $t("index.title") }} </Title>
    </Head>
    <h1 class="sr-only">{{ $t("id.topheading") }}</h1>

    <div
      v-if="searchData.length > 0"
      class="hidden flex-col md:flex md:w-60 lg:w-1/4"
    >
      <div class="flex h-9">
        <AppLink class="group flex items-center space-x-2 text-lg" to="/search">
          <Icon
            name="ion:return-up-back-sharp"
            size="1.7em"
            aria-hidden="true"
            class="bg-tpblue-400 h-7 w-12 rounded text-white group-hover:bg-blue-700"
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
        <ol ref="sidebar" class="overflow-y-auto" style="max-height: 0px">
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
        <input id="viewToggle" v-model="conceptViewToggle" type="checkbox" />
        <label for="viewToggle">{{ $t("id.tableview") }}</label>
      </div>
      <main ref="main" class="h-full">
        <h2 id="main" class="pb-4">
          <AppLink class="text-3xl" to="#main">{{ pagetitle }}</AppLink>
          <div v-if="data[id]?.memberOf">
            <AppLink
              class="text-lg text-gray-600 underline hover:text-black"
              :to="'/' + data[id]?.memberOf.split('-3A')[1]"
            >
              {{ $t("global.samling." + data[id]?.memberOf.split("-3A")[1]) }}
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
                  v-for="lang in displayInfo.displayLanguages"
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
                  v-for="lang in displayInfo.displayLanguages"
                  :key="'prefLabel_' + lang + i"
                >
                  {{
                    data[data[id]?.prefLabel[lang]?.[i]]?.literalForm["@value"]
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
                  v-for="lang in displayInfo.displayLanguages"
                  :key="'altLabel_' + lang + i"
                >
                  {{
                    data[data[id]?.altLabel[lang]?.[i]]?.literalForm["@value"]
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
                  v-for="lang in displayInfo.displayLanguages"
                  :key="'hiddenLabel' + lang + i"
                >
                  {{
                    data[data[id]?.hiddenLabel[lang]?.[i]]?.literalForm[
                      "@value"
                    ]
                  }}
                </td>
              </tr>
              <!--Definisjon-->
            </tbody>
          </table>
        </div>
        <div v-else class="grid gap-y-5">
          <div
            v-for="lang in displayInfo.displayLanguages"
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
                  v-for="def in data[id]?.definisjon?.[lang] ||
                  data[id]?.betydningsbeskrivelse?.[lang]"
                  :key="'definisjoin_' + def"
                  :data="data[def]?.label['@value']"
                  :label="$t('id.definisjon')"
                  :data-lang="lang"
                />
                <!--Anbefalt term-->
                <DataRow
                  v-for="label in data[id]?.prefLabel?.[lang]"
                  :key="'prefLabel_' + label"
                  :data="data[label]?.literalForm['@value']"
                  :label="$t('id.prefLabel')"
                  :data-lang="lang"
                />
                <!--AltLabel-->
                <DataRow
                  v-for="label in data[id]?.altLabel?.[lang]"
                  :key="'altLabel_' + label"
                  :data="data[label]?.literalForm['@value']"
                  :label="$t('id.altLabel')"
                  :data-lang="lang"
                />
                <!--HiddenLabel-->
                <DataRow
                  v-for="label in data[id]?.hiddenLabel?.[lang]"
                  :key="'hiddenLabel_' + label"
                  :data="data[label]?.literalForm['@value']"
                  :label="$t('id.hiddenLabel')"
                  :data-lang="lang"
                />
              </tbody>
            </table>
          </div>
          <div v-if="displayInfo.semanticRelations">
            <h3 id="relasjon" class="pb-1 text-xl">
              <AppLink to="#relasjon"> {{ $t("id.relasjon") }}</AppLink>
            </h3>
            <table>
              <tbody>
                <template v-for="relationType in semanticRelationTypes">
                  <template v-if="displayInfo.semanticRelations[relationType]">
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
            <h3 v-if="data[id]" id="felles" class="pb-1 text-xl">
              <AppLink to="#felles"> {{ $t("id.general") }}</AppLink>
            </h3>
            <table>
              <tbody>
                <!--Termbase-->
                <DataRow
                  v-if="data[id]?.memberOf"
                  :data="
                    $t('global.samling.' + data[id]?.memberOf.split('-3A')[1])
                  "
                  :to="`/${samling}`"
                  :label="$t('id.collection')"
                />
                <!--Domene-->
                <DataRow
                  v-if="data[id]?.domene"
                  :data="data[id]?.domene"
                  :label="$t('id.domain')"
                />
                <!--Bruksområde-->
                <DataRow
                  v-if="data[id]?.subject"
                  :data="data[id]?.subject.join(', ')"
                  :label="$t('id.subject')"
                />
                <!--Modified-->
                <DataRow
                  v-if="data[id]?.modified"
                  :data="data[id]?.modified['@value']"
                  :label="$t('id.modified')"
                />
                <!--Created-->
                <!--Note TODO after export fix-->
                <DataRow
                  v-if="data[id]?.scopeNote"
                  :data="data[id]?.scopeNote"
                  th-class=""
                  :label="$t('id.note')"
                />
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { SemanticRelation } from "utils/vars";
import { LocalLangCode } from "~~/utils/vars-language";

const runtimeConfig = useRuntimeConfig();
const i18n = useI18n();
const route = useRoute();
const samling = route.params.samling;
const idArray = route.params.id as Array<string>;
const dataDisplayLanguages = useDataDisplayLanguages();
const conceptViewToggle = useConceptViewToggle();
const searchData = useSearchData();

let base: string;
let id: string;
if (!Object.keys(termbaseUriPatterns).includes(samling)) {
  base = runtimeConfig.public.base;
  id = `${samling}-3A${idArray[0]}`;
} else {
  base = termbaseUriPatterns[samling][idArray[0]];
  id = idArray.slice(1).join("/");
}

const pagetitle = computed(() => {
  if (data.value[id]) {
    return getConceptDisplaytitle(data.value, id);
  } else {
    return "";
  }
});

function getConceptDisplaytitle(data, id: string): string | null {
  let title = null;
  const languages = languageOrder[i18n.locale.value as LocalLangCode].slice(
    0,
    3
  );
  for (const label of ["prefLabel", "altLabel"]) {
    for (const lang of languages) {
      if (data[data[id]?.[label][lang]]) {
        title = data[data[id]?.[label][lang]?.[0]]?.literalForm["@value"];
        break;
      }
    }
    if (title) {
      break;
    }
  }
  return title;
}

const fetchedData = ref({});
const data = computed(() => {
  if (fetchedData.value?.["@graph"]) {
    const identified = identifyData(fetchedData.value?.["@graph"]);
    let labels: string[] = [id];
    for (const type of semanticRelationTypes) {
      if (identified[id][type]) {
        labels = labels.concat(identified[id][type]);
      }
    }
    const labeled = idSubobjectsWithLang(identified, labels, [
      "prefLabel",
      "altLabel",
      "hiddenLabel",
      "definisjon",
      "betydningsbeskrivelse",
    ]);
    return labeled;
  } else {
    return {};
  }
});

const displayInfo = computed(() => {
  const conceptLanguages = getConceptLanguages(data.value[id]);
  const displayLanguages = dataDisplayLanguages.value.filter((language) =>
    Array.from(conceptLanguages).includes(language)
  );
  const prefLabelLength = getMaxNumberOfInstances(data.value?.[id]?.prefLabel);
  const altLabelLength = getMaxNumberOfInstances(data.value?.[id]?.altLabel);
  const hiddenLabelLength = getMaxNumberOfInstances(
    data.value?.[id]?.hiddenLabel
  );
  const info = {
    conceptLanguages,
    displayLanguages,
    prefLabelLength,
    altLabelLength,
    hiddenLabelLength,
  };
  for (const relationType of semanticRelationTypes) {
    const data = getRelationData(relationType);
    if (data) {
      try {
        info.semanticRelations[relationType] = data;
      } catch {
        info.semanticRelations = {};
        info.semanticRelations[relationType] = data;
      }
    }
  }
  return info;
});

function getRelationData(
  data,
  relationType: SemanticRelation
): Array<Array<string>> | null {
  // Check if concept with id has relation of relationtype
  if (data[id]?.[relationType]) {
    return data[id]?.[relationType].map((target: string) => {
      try {
        const label = getConceptDisplaytitle(data, target);
        const link = "/" + target.replace("-3A", "/");
        // Don't return links with no label -> linked concept doesn't exist
        if (label) {
          return [label, link];
        } else {
          return null;
        }
      } catch (error) {
        return null;
      }
    });
  } else {
    return null;
  }
}

async function fetchConceptData() {
  const fetched = await fetchData(
    genConceptQuery(base, route.path, id),
    "application/ld+json"
  );
  const compacted = await compactData(fetched, base);
  fetchedData.value = compacted;
}
fetchConceptData();

// Resize sidebar
const sidebar = ref(null);
const main = ref(null);
useResizeObserver(main, (e) => {
  if (sidebar.value) {
    sidebar.value.style.maxHeight = `${main.value.offsetHeight - 95}px`;
  }
});

const searchScrollBarPos = useSearchScrollBarPos();
onMounted(() => {
  if (sidebar.value) {
    sidebar.value.scrollTop = searchScrollBarPos.value;
  }
});

onBeforeUnmount(() => {
  if (sidebar.value) {
    searchScrollBarPos.value = sidebar.value.scrollTop;
  }
});
</script>
