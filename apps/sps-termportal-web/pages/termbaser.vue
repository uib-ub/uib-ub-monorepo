<template>
  <div>
    <Head>
      <Title>{{ $t("global.termbase", 2) }} | {{ $t("index.title") }}</Title>
    </Head>
    <TermbaseList :key="'tblist' + locale" />
  </div>
</template>

<script setup lang="ts">
const locale = useLocale();
</script>
