<template>
  <div>
    <Head>
      <Title>{{ $t("hjelp.title") }} | {{ $t("index.title") }}</Title>
    </Head>
    <div class="flex">
      <SideBar />
      <main class="max-w-2xl">
        <h1
          id="main"
          class="pb-3 pt-6"
        >
          <AppLink
            to="#main"
            class="tp-hover-focus border-transparent py-1 text-3xl"
          >
            {{ $t("hjelp.title") }}
          </AppLink>
        </h1>
        <ContentRenderer
          v-if="main"
          :key="mainKey"
          :value="main"
          class="content-wrapper"
        />
        <Accordion
          multiple
          class="mt-6"
        >
          <AccordionTab>
            <template #header>
              <h2 class="font-semibold">
                {{ $t("hjelp.search") }}
              </h2>
            </template>
            <ContentRenderer
              v-if="search"
              :key="searchKey"
              :value="search"
              class="content-wrapper"
            />
          </AccordionTab>
        </Accordion>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const locale = useLocale();

const mainKey = computed(() => `help_main_${locale.value}`);
const { data: main, refresh: refreshMain } = await useAsyncData(mainKey.value, () => {
  return queryCollection("docs").path(`/web/${locale.value}/hjelp/main`).first();
});

const searchKey = computed(() => `help_search_${locale.value}`);
const { data: search, refresh: refreshSearch } = await useAsyncData(searchKey.value, () => {
  return queryCollection("docs").path(`/web/${locale.value}/hjelp/search`).first();
});

watch(() => locale.value, () => {
  refreshMain();
  refreshSearch();
});
</script>
