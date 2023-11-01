<template>
  <div ref="studioref" id="studio"></div>
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
  height: 100vh;
  max-height: 100dvh;
  overscroll-behavior: none;
  -webkit-font-smoothing: antialiased;
  overflow: auto;
}
</style>
