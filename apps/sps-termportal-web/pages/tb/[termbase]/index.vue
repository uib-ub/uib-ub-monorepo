<template>
  <div class="flex">
    <Head>
      <Title>{{ lalof(termbase + "-3A" + termbase) }} | Termportalen</Title>
    </Head>
    <div class="flex">
      <SideBar />
      <div class="space-y-6">
        <UtilsTransitionOpacitySection>
          <main
            v-if="data && bootstrapData.loaded"
            class="md:max-w-3xl lg:max-w-4xl"
          >
            <h1 id="main" class="pb-3 pt-5 text-2xl">
              <AppLink to="#main">
                {{ lalof(termbase + "-3A" + termbase) }}
              </AppLink>
            </h1>
            <!-- Only apply termbaseDescriptionHeight on larger screens-->
            <div
              class="flex lg:block overflow-hidden"
              :style="
                ['lg', 'xl', '2xl'].includes(breakpoint)
                  ? `max-height: ${termbaseDescriptionHeight}px`
                  : ''
              "
            >
              <div
                ref="termbaseText"
                class="flex lg:block lg:flex-col flex-col-reverse space-y-2"
              >
                <div
                  ref="termbaseInfoBox"
                  class="lg:float-right lg:ml-3 lg:mb-2 mt-6 lg:mt-0 relative z-10 bg-white"
                >
                  <TermbaseInfoBox :data="data" :termbase-id="termbase" />
                </div>
                <p v-for="p in description" :key="p" v-html="p" />
              </div>
            </div>
            <button
              v-if="['lg', 'xl', '2xl'].includes(breakpoint)"
              class="w-full mt-1"
              :class="{
                'shadow-[0_-10px_7px_rgba(255,255,255,1)]': !expandTermbaseText,
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
const breakpoint = useBreakpoint();

const termbaseInfoBox = ref();
const termbaseText = ref();
const expandTermbaseText = ref(false);

// Only picked up in larger screens. See check in template.
const termbaseDescriptionHeight = computed(() => {
  if (termbaseInfoBox.value && termbaseText.value) {
    if (expandTermbaseText.value) {
      return termbaseText.value.clientHeight + 8;
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
