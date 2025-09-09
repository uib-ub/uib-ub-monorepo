<template>
  <div>
    <Head>
      <Title>{{ $t("index.title") }}</Title>
    </Head>
    <header>
      <h1 class="text-5xl xs:text-6xl sm:text-7xl md:text-8xl">
        <LogoTermportalen
          class="mb-6 ml-2 mr-14 mt-7 max-w-100 sm:mb-8 sm:mt-8 md:mb-9 md:ml-9 md:mt-8 lg:ml-7 lg:mt-14"
        />
        <span class="sr-only">Termportalen</span>
      </h1>
    </header>
    <main class="container">
      <div class="border-grey space-y-px">
        <SearchField />
        <div class="w-full">
          <HeaderSearchOptions class="pt-2" />
          <HeaderSearchScope />
        </div>
      </div>
      <div class="mt-1 border-b-2" />
      <div
        class="flex flex-col justify-between gap-x-8 gap-y-6 pt-6 lg:flex-row"
      >
        <div class="basis-7/12">
          <ContentRenderer
            v-if="page"
            :value="page"
            class="content-wrapper"
          />
        </div>
        <NewsWrapper
          :key="`news${locale}`"
          class="basis-5/12"
        />
      </div>
      <CollaboratorsTP class="mt-8 xl:mt-12" />
    </main>
    {{ page }}
  </div>
</template>

<script setup lang="ts">
const locale = useLocale();
const route = useRoute();

const { data: page } = await useAsyncData("mykey", () => {
  return queryCollection("docs").path("/web/nb/welcome").first();
});
</script>
