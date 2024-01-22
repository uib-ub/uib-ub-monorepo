<template>
  <main class="container">
    <Head>
      <Title>{{ $t("index.title") }}</Title>
    </Head>
    <div class="border-grey my-2 border-b-2 px-2">
      <SearchField />
      <HeaderSearchOptions class="pt-2" />
      <HeaderSearchScope />
    </div>
    <div class="flex flex-col gap-x-8 gap-y-6 pt-6 lg:flex-row">
      <ContentDoc
        :path="`/${locale}/welcome`"
        class="content-page basis-7/12"
      />
      <NewsTP class="basis-5/12" />
    </div>
    <CollaboratorsTP class="mt-6 xl:mt-8" />
  </main>
</template>
<script setup lang="ts">
const locale = useLocale();
</script>

<style>
.content-page p {
  @apply py-1.5;
}
</style>
