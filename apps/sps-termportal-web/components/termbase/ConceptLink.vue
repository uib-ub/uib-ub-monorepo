<template>
  <AppLink :to="concept.link" @click="triggerConceptVisitEvent(concept.link)"
    ><span
      :lang="concept.language"
      class="hover:underline underline-offset-2"
      :class="{ 'text-gray-400': pending }"
      v-html="concept.label"
    ></span
  ></AppLink>
</template>

<script setup lang="ts">
const props = defineProps({
  concept: { type: Object, required: true },
  pending: { type: Boolean, default: false },
});

function triggerConceptVisitEvent(targetRoute: string) {
  const splitRoute = targetRoute.split("/");
  const termbase = splitRoute[2];
  const termpost = splitRoute.slice(2).join("/");
  pushTermbaseConceptListVisitEvent(termbase, termpost);
}
</script>
