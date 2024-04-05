<template>
  <div class="flex h-full">
    <Head>
      <Title> {{ pagetitle }} | {{ $t("index.title") }} </Title>
    </Head>
    <h1 class="sr-only">{{ $t("id.topheading") }}</h1>
    <div class="flex">
      <SideBar />
      <div class="flex">
        <!-- Search results -->
        <div
          v-if="searchData.length > 0"
          class="hidden max-w-[22em] shrink-0 flex-col md:flex md:w-[28vw] lg:w-[22vw] xl:w-[18vw] pr-3 lg:pr-6"
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
        <!-- Termpost -->
        <div class="flex grow flex-col">
          <main ref="main" class="h-full">
            <h2 id="main" class="pb-4">
              <AppLink class="text-3xl" to="#main">
                <span v-html="pagetitle"></span
              ></AppLink>
              <div v-if="concept?.memberOf">
                <AppLink
                  class="text-lg text-gray-600 underline hover:text-black"
                  :to="'/' + concept?.memberOf.split('-3A')[1]"
                >
                  {{ lalof(concept.memberOf) }}
                </AppLink>
              </div>
            </h2>
            <TermpostBase :data="data" :main-concept-id="procId" />
            <div v-if="error">Error</div>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Samling } from "~~/utils/vars-termbase";

const route = useRoute();
const searchScrollBarPos = useSearchScrollBarPos();
const searchData = useSearchData();

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
  // base = runtimeConfig.public.base;
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

const { data, error } = await useAsyncData(
  `concept${termbase}${idArray.join("")}`,
  () =>
    $fetch(`/api/concept/${termbase}/${encodeURI(idArray.join("/"))}`, {
      method: "GET",
      headers: process.server
        ? { cookie: "session=" + useRuntimeConfig().apiKey }
        : undefined,
      //      body: { concept: idArray.join("/"), base, termbase },
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
</script>
