<template>
  <div class="flex">
    <Head>
      <Title>{{ getLaLo(termbase + "-3A" + termbase) }} | Termportalen</Title>
    </Head>
    <div class="flex grow">
      <SideBar />
      <div class="max-w-4xl grow space-y-6">
        <main
          v-if="bootstrapData && data"
          :key="`termbase_${termbase}_${bootstrapData ? Object.keys(bootstrapData.termbase).length : 'none'}_${data ? data.identifier : 'none'}`"
          class="md:max-w-3xl lg:max-w-4xl"
        >
          <h1
            id="main"
            class="pb-3 pt-5 text-2xl"
          >
            <AppLink to="#main">
              {{ getLaLo(termbase + "-3A" + termbase) }}
            </AppLink>
          </h1>
          <div class="flex overflow-hidden lg:block">
            <div class="flex flex-col-reverse space-y-2 lg:block lg:flex-col">
              <div
                class="relative z-10 mt-6 bg-white lg:float-right lg:mb-2 lg:ml-3 lg:mt-0"
              >
                <TermbaseInfoBox
                  :data="data"
                  :termbase-id="termbase"
                />
              </div>
              <div class="space-y-2">
                <p
                  v-for="p in description"
                  :key="p"
                  v-html="p"
                />
              </div>
            </div>
          </div>
        </main>
        <TermbaseSearch
          v-if="data"
          :termbase-id="termbase"
        />
        <TermbaseConcepts
          v-if="data"
          :key="'concepts' + termbase"
          :termbase-id="termbase"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const bootstrapData = useBootstrapData();

const route = useRoute();
const termbase = computed(() => getTermbaseFromParam());
const localeLangOrder = useLocaleLangOrder();
const { getLaLo } = useLazyLocale();

const { data } = await useLazyFetch<Termbase>(
  `/api/termbase/${termbase.value}`,
  {
    key: `termbase_${termbase.value}`,
    headers: import.meta.server
      ? { cookie: "session=" + useRuntimeConfig().apiKey }
      : undefined,
  },
);

const description = computed(() => {
  for (const lang of localeLangOrder.value) {
    const localLangcode = lang as LocalLangCode;
    const desc = data.value?.description?.[localLangcode];
    if (desc) {
      return desc.split("\n\n");
    }
  }
  return [];
});

function getTermbaseFromParam() {
  const termbase = route.params.termbase;
  if (typeof termbase === "string") {
    return termbase;
  }
  else {
    return termbase[0];
  }
}
</script>
