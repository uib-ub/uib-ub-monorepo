<template>
  <h3
    v-if="predicate == 'prefLabel'"
    class=""
  >
    <b
      :lang="(intersectUnique(
        localeLangOrder,
        labelLang as LangCode[])[0]
      )"
      :class="{
        'text-right': langRtoL(labelLang[0] as LangCode),
      }"
      v-html="labelData"
    />
  </h3>
  <h3
    v-else
    class=""
    :lang="(intersectUnique(
      localeLangOrder,
      labelLang as LangCode[])[0]
    )"
    v-html="labelData"
  />
</template>

<script setup lang="ts">
import { langRtoL, intersectUnique } from "#imports";

const localeLangOrder = useLocaleLangOrder();

defineProps({
  predicate: { type: String, required: true },
  labelData: { type: String, required: true },
  labelLang: { type: Array, required: true },
});
</script>

<style>
mark {
  background-color: #e2efff;
  }
</style>
