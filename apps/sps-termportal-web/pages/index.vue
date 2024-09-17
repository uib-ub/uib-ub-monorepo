<template>
  <div>
    <Head>
      <Title>{{ $t("index.title") }}</Title>
    </Head>
    <header>
      <h1 class="text-5xl xs:text-6xl sm:text-7xl md:text-8xl">
        <LogoTermportalen
          class="mb-6 ml-2 mr-14 mt-7 max-w-[25rem] sm:mb-8 sm:mt-8 md:mb-9 md:ml-9 md:mt-8 lg:ml-7 lg:mt-14"
        />
        <span class="sr-only">Termportalen</span>
      </h1>
    </header>
    <main class="container">
      <div class="border-grey space-y-[1px]">
        <SearchField />
        <div class="w-full">
          <HeaderSearchOptions class="pt-2" />
          <HeaderSearchScope />
        </div>
      </div>
      <div class="border-b-2 mt-1"></div>
      <div
        class="flex flex-col gap-x-8 gap-y-6 pt-6 lg:flex-row justify-between"
      >
        <div class="basis-7/12">
          <ContentDoc
            :key="`welcome${locale}`"
            :head="false"
            :path="`/${locale}/welcome`"
            class="content-wrapper"
          />
        </div>
        <NewsWrapper :key="`news${locale}`" class="basis-5/12"></NewsWrapper>
      </div>
      <CollaboratorsTP class="mt-8 xl:mt-14" />
    </main>
  </div>
</template>
<script setup lang="ts">
const locale = useLocale();
</script>
