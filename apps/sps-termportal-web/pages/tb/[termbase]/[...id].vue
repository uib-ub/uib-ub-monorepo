<template>
  <div class="flex h-full">
    <h1 class="sr-only">{{ $t("id.topheading") }}</h1>
    <div class="flex">
      <SideBar />
      <div class="flex">
        <!-- Search results -->
        <div
          v-if="searchData.length > 0 && termpostContext"
          class="hidden max-w-[22em] shrink-0 flex-col pr-3 md:flex md:w-[28vw] lg:w-[22vw] lg:pr-6 xl:w-[18vw]"
        >
          <BackToSearch />
          <nav aria-labelledby="sidebarresults">
            <h2 id="sidebarresults" class="pb-2 pt-3 text-2xl">
              {{ $t("searchFilter.results-heading") }}
            </h2>
            <div ref="sidebar" class="overflow-y-auto" style="height: 0px">
              <SearchResultsList context="sidebar" />
            </div>
          </nav>
        </div>
        <!-- Termpost -->
        <div class="flex grow flex-col">
          <main ref="main" class="h-full">
            <UtilsTransitionOpacitySection>
              <TermpostBase
                v-if="conceptUrl && mainConceptId"
                :concept-url="conceptUrl"
                :main-concept-id="mainConceptId"
                :mainp="true"
              />
            </UtilsTransitionOpacitySection>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TermbaseId } from "~~/utils/vars-termbase";

const route = useRoute();
const router = useRouter();
const termpostContext = useTermpostContext();
const searchScrollBarPos = useSearchScrollBarPos();
const searchData = useSearchData();

const sidebar = ref(null);
const main = ref(null);
const termbase = route.params.termbase as TermbaseId;
const idArray = route.params.id as Array<string>;

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

onMounted(async () => {
  await nextTick();
  if (sidebar.value) {
    sidebar.value.scrollTo(0, searchScrollBarPos.value);
  }
  // Check if navigated from termbase page
  if (
    router?.options?.history?.state?.back?.split("/").length <= 3 &&
    router?.options?.history?.state?.back?.startsWith("/tb/")
  ) {
    termpostContext.value = false;
  } else {
    termpostContext.value = true;
  }
});

onBeforeUnmount(() => {
  if (sidebar.value) {
    searchScrollBarPos.value = sidebar.value.scrollTop;
  }
});
</script>
