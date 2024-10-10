<template>
  <h3 v-if="predicate == 'prefLabel'" class="grow">
    <b
      :lang="(intersectUnique(
                localeLangOrder,
                labelLang as LangCode[])[0]
              )"
      :class="{
                'text-right': langRtoL(labelLang[0] as LangCode)
              }"
      v-html="labelData"
    ></b>
  </h3>
  <h3
    v-else
    class="grow"
    :lang="(intersectUnique(
                localeLangOrder,
                labelLang as LangCode[])[0]
              )"
    v-html="labelData"
  ></h3>
</template>

<script setup lang="ts">
import { LangCode } from "~/composables/locale";

const localeLangOrder = useLocaleLangOrder();

const props = defineProps({
  predicate: { type: String, required: true },
  labelData: { type: String, required: true },
  labelLang: { type: Array, required: true },
});
</script>
