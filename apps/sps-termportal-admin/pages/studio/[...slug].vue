<template>
  <div id="studio" ref="studioref"></div>
</template>

<script setup lang="ts">
import { renderStudio } from "sanity";
import { sanityConfig } from "~/sanity.config";

definePageMeta({
  layout: "studio",
});

const studioref = ref();

onMounted(() => {
  renderStudio(studioref.value, sanityConfig);
});
</script>

<style>
#studio {
  height: calc(100vh - 52px);
  max-height: 100dvh;
  overscroll-behavior: none;
  -webkit-font-smoothing: antialiased;
  overflow: auto;
}
</style>
