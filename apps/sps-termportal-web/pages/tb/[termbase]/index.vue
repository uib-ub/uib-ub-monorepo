<template>
  <div class="flex">
    <Head>
      <Title>{{ lalof(termbase + "-3A" + termbase) }} | Termportalen</Title>
    </Head>
    <div class="flex">
      <SideBar />
      <div class="space-y-5">
        <UtilsTransitionOpacitySection>
          <main v-if="data && bootstrapData.loaded">
            <h1 id="main" class="pb-3 pt-5 text-2xl">
              <AppLink to="#main">
                {{ lalof(termbase + "-3A" + termbase) }}
              </AppLink>
            </h1>
            <div class="flex flex-col gap-5 lg:flex-row justify-between">
              <!--Description-->
              <div class="max-w-prose basis-GRb space-y-2">
                <p v-for="p in description" :key="p" v-html="p" />
              </div>
              <TermbaseInfoBox :data="data" :termbase-id="termbase" />
            </div>
          </main>
        </UtilsTransitionOpacitySection>
        <TermbaseSearch :termbase-id="termbase" />
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
const route = useRoute();
const termbase = getTermbaseFromParam();
const localeLangOrder = useLocaleLangOrder();
const bootstrapData = useBootstrapData();

const { data } = await useLazyFetch(`/api/termbase/${termbase}`, {
  key: `termbase_${termbase}`,
  headers: process.server
    ? { cookie: "session=" + useRuntimeConfig().apiKey }
    : undefined,
});
const description = computed(() => {
  let description = "";
  for (const lang of localeLangOrder.value) {
    if (data.value?.description?.[lang]) {
      try {
        description = data.value?.description?.[lang];
      } catch (e) {}
      break;
    }
  }
  return description.split("\n\n");
});

function getTermbaseFromParam() {
  const termbase = route.params.termbase;
  if (typeof termbase === "string") {
    return termbase;
  } else {
    return termbase[0];
  }
}
</script>
