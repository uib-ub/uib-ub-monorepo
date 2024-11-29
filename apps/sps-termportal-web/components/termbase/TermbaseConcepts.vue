<template>
  <section class="m-4">
    <h2 class="text-xl">{{ $t("global.concept", 2) }}</h2>
    <pre>{{ displayData }}</pre>
  </section>
</template>

<script setup lang="ts">
const locale = useLocale();

const props = defineProps({
  termbaseId: { type: String, required: true },
  sortingOrder: { type: String, default: "asc" },
});

const { data } = await useFetch(
  `/api/termbase/${props.termbaseId.toLowerCase()}/concepts`,
  {
    method: "POST",
    body: { language: locale, sortOrder: props.sortingOrder },
  }
);

const displayData = computed(() => {
  return data.value?.map((concept) => {
    return {
      link: idOrUriToRoute(props.termbaseId, concept._source.id),
      label: concept._source.displayLabel[locale.value]?.value,
      language: concept._source.displayLabel[locale.value]?.language,
    };
  });
});
</script>
