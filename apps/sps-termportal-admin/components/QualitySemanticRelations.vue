<template>
  <section class="space-y-2">
    <h2 class="mb-3 text-xl">Imported semantic relations</h2>
    <p>Termbase MUST NOT have unspecified semantic relations.</p>
    <p>
      Only applies to imports from Språkrådets termwiki where we moved
      unspecified links to the temporary semantic relation field.
    </p>
    <DataTable
      ref="datatable"
      :value="relations"
      paginator
      :rows="15"
      removable-sort
      table-style="min-width: 1rem"
    >
      <Column field="link" header="Link" sortable>
        <template #body="slotProps">
          <AppLink :to="slotProps.data.link">{{
            slotProps.data.concept
          }}</AppLink>
        </template>
      </Column>
      <Column field="relations" header="Semantic Relations" sortable></Column>
      <template #footer>
        <div style="text-align: right">
          <Button label="Eksport" @click="exportCSV($event)" />
        </div>
      </template>
    </DataTable>
  </section>
</template>

<script setup lang="ts">
const props = defineProps({ termbase: { type: Object, required: true } });

const datatable = ref();

const { data } = useLazyFetch(
  `/api/tb/${props.termbase.id}/qualitySemanticRelations`,
  { method: "post", body: { internal: true } }
);

const relations = computed(() => {
  return data?.value?.results?.bindings.map((e) => {
    return {
      concept: e.concept.value
        .split("/")
        .slice(-1)[0]
        .split("-3A")
        .slice(-1)[0],
      link:
        "https://wiki.terminologi.no/index.php?title=" +
        e.concept.value.split("/").slice(-1)[0].split("-3A").join(":"),
      relations: e.relations.value
        .split(";")
        .map((rel) => rel.split("/").slice(-1)[0].split("-3A").slice(-1)[0])
        .join(", "),
    };
  });
});

const exportCSV = () => {
  datatable.value.exportCSV();
};
</script>
