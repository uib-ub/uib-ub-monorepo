<template>
  <div class="flex h-full">
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
            <TermpostBase
              v-if="mainConceptId"
              :concept-url="conceptUrl"
              :main-concept-id="mainConceptId"
              :mainp="true"
            />
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

function getConceptId(termbase, idArray) {
  let id: string;
  let mainConceptId: string;
  if (!Object.keys(termbaseUriPatterns).includes(termbase)) {
    id = `${termbase}-3A${idArray[0]}`;
    mainConceptId = id;
  } else {
    const base = termbaseUriPatterns[termbase][idArray[0]];
    id = idArray.slice(1).join("/");
    mainConceptId = base + id;
  }
  return mainConceptId;
}

const conceptUrl = `${termbase}/${encodeURI(idArray.join("/"))}`;
const mainConceptId = getConceptId(termbase, idArray);

useResizeObserver(main, (e) => {
  if (sidebar.value) {
    sidebar.value.style.height = `${main.value.offsetHeight - 88}px`;
  }
});

onBeforeUnmount(() => {
  if (sidebar.value) {
    searchScrollBarPos.value = sidebar.value.scrollTop;
  }
});
</script>
