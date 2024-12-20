<template>
  <div class="flex">
    <Head>
      <Title>{{ lalof(termbase + "-3A" + termbase) }} | Termportalen</Title>
    </Head>
    <div class="flex">
      <SideBar />
      <div class="space-y-6">
        <UtilsTransitionOpacitySection>
          <main v-if="data && bootstrapData.loaded">
            <h1 id="main" class="pb-3 pt-5 text-2xl">
              <AppLink to="#main">
                {{ lalof(termbase + "-3A" + termbase) }}
              </AppLink>
            </h1>
            <div
              class="flex lg:block flex-col-reverse overflow-hidden"
              :style="`max-height: ${termbaseDescriptionHeight}px`"
            >
              <div
                ref="termbaseInfoBox"
                class="lg:float-right lg:mx-5 lg:mb-2 mt-6 lg:mt-0"
              >
                <TermbaseInfoBox
                  ref="termbaseInfoBox"
                  :data="data"
                  :termbase-id="termbase"
                />
              </div>
              <div ref="termbaseText" class="max-w-4xl space-y-2">
                <p v-for="p in description" :key="p" v-html="p" />
              </div>
            </div>
            <button
              class="w-full"
              :class="{
                'shadow-[0_-8px_11px_rgba(255,255,255,1)]': !expandTermbaseText,
              }"
              @click="expandTermbaseText = !expandTermbaseText"
            >
              <span
                v-if="expandTermbaseText"
                class="underline underline-offset-2 hover:decoration-2"
                >{{ $t("global.readLess") }}</span
              >
              <span
                v-else
                class="underline underline-offset-2 hover:decoration-2"
              >
                {{ $t("global.readMore") }}</span
              >
            </button>
          </main>
        </UtilsTransitionOpacitySection>
        <TermbaseSearch v-if="data" :termbase-id="termbase" />
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

const termbaseInfoBox = ref();
const termbaseText = ref();
const expandTermbaseText = ref(false);
const termbaseDescriptionHeight = computed(() => {
  if (termbaseInfoBox.value && termbaseText.value) {
    if (expandTermbaseText.value) {
      return termbaseText.value.clientHeight;
    } else {
      return termbaseInfoBox.value.clientHeight + 8;
    }
  }
});

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
