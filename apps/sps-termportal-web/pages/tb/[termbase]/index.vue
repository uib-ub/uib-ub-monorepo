<template>
  <div
    :key="`termbase_${termbase}_${(bootstrapData ? Object.keys(bootstrapData.termbase).length : '')}_${data ? data.identifier : ''}`"
    class="flex"
  >
    <Head>
      <Title>{{ getLaLo(termbase + "-3A" + termbase) }} | Termportalen</Title>
    </Head>
    <div class="flex grow">
      <SideBar />
      <div class="max-w-4xl grow space-y-6">
        <UtilsTransitionOpacitySection>
          <main
            v-if="bootstrapData && data"
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
            <!-- Only apply termbaseDescriptionHeight on larger screens -->
            <div
              class="flex overflow-hidden lg:block"
              :style="
                termbaseDescriptionHeight
                  && ['lg', 'xl', '2xl'].includes(breakpoint)
                  ? `max-height: ${termbaseDescriptionHeight}px`
                  : ''
              "
            >
              <div
                ref="termbaseTextRef"
                class="flex flex-col-reverse space-y-2 lg:block lg:flex-col"
              >
                <div
                  ref="termbaseInfoBoxRef"
                  class="relative z-10 mt-6 bg-white lg:float-right lg:mb-2 lg:ml-3 lg:mt-0"
                >
                  <TermbaseInfoBox
                    :data="data"
                    :termbase-id="termbase"
                  />
                </div>
                <p
                  v-for="p in description"
                  :key="p"
                  v-html="p"
                />
              </div>
            </div>
            <button
              v-if="
                ['lg', 'xl', '2xl'].includes(breakpoint)
                  && termbaseTextRef
                  && termbaseInfoBoxRef
                  && termbaseTextRef.clientHeight > termbaseInfoBoxRef.clientHeight
              "
              class="mt-1 w-full"
              :class="{
                'shadow-[0_-10px_7px_rgba(255,255,255,1)]': !expandTermbaseText,
              }"
              @click="expandTermbaseText = !expandTermbaseText"
            >
              <span
                v-if="expandTermbaseText"
                class="underline underline-offset-2 hover:decoration-2"
              >{{ $t("global.readLess") }}</span>
              <span
                v-else
                class="underline underline-offset-2 hover:decoration-2"
              >
                {{ $t("global.readMore") }}</span>
            </button>
          </main>
        </UtilsTransitionOpacitySection>
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
const route = useRoute();
const termbase = getTermbaseFromParam();
const localeLangOrder = useLocaleLangOrder();
const bootstrapData = useBootstrapData();
const breakpoint = useBreakpoint();
const { getLaLo } = useLazyLocale();

const termbaseInfoBoxRef = ref<HTMLElement | null>(null);
const termbaseTextRef = ref<HTMLElement | null>(null);
const expandTermbaseText = ref(false);

// Only picked up in larger screens. See check in template.
const termbaseDescriptionHeight = computed(() => {
  const baseHeight = 8;
  if (
    termbaseInfoBoxRef.value?.clientHeight
    && termbaseTextRef.value?.clientHeight
  ) {
    if (expandTermbaseText.value) {
      return termbaseTextRef.value.clientHeight + baseHeight;
    }
    else {
      return termbaseInfoBoxRef.value.clientHeight + baseHeight;
    }
  }
  return baseHeight;
});

const { data } = await useLazyFetch<Termbase>(`/api/termbase/${termbase}`, {
  key: `termbase_${termbase}`,
  headers: import.meta.server
    ? { cookie: "session=" + useRuntimeConfig().apiKey }
    : undefined,
});

const description = computed(() => {
  let description = "";
  for (const lang of localeLangOrder.value) {
    const localLangcode = lang as LocalLangCode;
    if (data.value?.description?.[localLangcode]) {
      try {
        description = data.value?.description?.[localLangcode];
      }
      catch (e) {}
      break;
    }
  }
  return description.split("\n\n");
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
