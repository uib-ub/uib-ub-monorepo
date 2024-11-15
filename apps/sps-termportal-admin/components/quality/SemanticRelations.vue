<template>
  <UtilsTableWrapper v-if="termbase?.conceptCount > 0">
    <template #header>Imported semantic relations</template>
    <template #description>
      <p>
        <span class="font-semibold">{{ relations?.length }}</span> concepts have
        unspecified semantic relations.
      </p>
      <p>Termbase MUST NOT have unspecified semantic relations.</p>
      <p>
        Only applies to imports from Språkrådets termwiki where we moved
        unspecified links to the temporary semantic relation field.
      </p>
    </template>
    <DataTable
      v-if="relations?.length > 0"
      ref="datatable"
      :value="relations"
      paginator
      :rows="15"
      removable-sort
      table-style="min-width: 1rem"
    >
      <template #header>
        <div style="text-align: right">
          <Button class="h-10" label="Eksport" @click="exportCSV()" />
        </div>
      </template>
      <Column field="link" header="Link" sortable>
        <template #body="slotProps">
          <AppLink :to="slotProps.data.link">{{
            slotProps.data.concept
          }}</AppLink>
        </template>
      </Column>
      <Column field="relations" header="Semantic Relations" sortable></Column>
    </DataTable>
  </UtilsTableWrapper>
</template>

<script setup lang="ts">
const props = defineProps({ termbase: { type: Object, required: true } });

const datatable = ref();

const { data } = useLazyFetch(
  `/api/tb/${props.termbase.id}/qualitySemanticRelations`,
  { query: { internal: true } }
);

const relations = computed(() => {
  if (data.value) {
    return data?.value.map((e) => {
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
  }
});

const exportCSV = () => {
  datatable.value.exportCSV();
};
</script>
