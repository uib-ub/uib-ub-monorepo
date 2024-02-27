<template>
  <section>
    {{ relations }}
  </section>
</template>

<script setup lang="ts">
const props = defineProps({ termbase: { type: Object, required: true } });

const datatable = ref();

const { data } = useLazyFetch(
  `/api/tb/${props.termbase.id}/qualitySemanticRelations`
);

const relations = computed(() => {
  return data?.value?.results?.bindings.map((e) => {
    return {
      concept: e.concept.value
        .split("/")
        .slice(-1)[0]
        .split("-3A")
        .slice(-1)[0],
      link: e.concept.value.split("/").slice(-1)[0].split("-3A").join("/"),
      relations: e.relations.value
        .split(";")
        .map((rel) => rel.split("/").slice(-1)[0].split("-3A").slice(-1)[0]).join(", "),
    };
  });
});

const exportCSV = () => {
  datatable.value.exportCSV();
};
</script>
