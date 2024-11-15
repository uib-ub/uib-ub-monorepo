<template>
  <UtilsTableWrapper v-if="termbase?.conceptCount > 0">
    <template #header>Missing definitions</template>
    <template #description>
      <UtilsTableLegend>
        <UtilsTableLegendEntry
          :legend-key="termbase?.conceptCount"
          legend-value="concepts"
          legend-width="16"
        />
        <UtilsTableLegendEntry
          :legend-key="`${concepts?.length}${
            concepts?.length === limit ? '+' : ''
          }`"
          legend-value="concepts are missing definitions"
          legend-width="16"
        />
        <UtilsTableLegendEntry
          v-if="concepts?.length !== limit"
          :legend-key="`${
            concepts?.length === 0
              ? 0
              : concepts?.length == termbase?.conceptCount
              ? 100
              : ((concepts?.length / termbase.conceptCount) * 100).toFixed(2)
          } %`"
          legend-value="of concepts are missing definitions"
          legend-width="16"
        />
      </UtilsTableLegend>
      <p v-if="concepts?.length === limit">
        Fetch limit set to {{ limit }}, i.e. if {{ limit }} concepts have been
        fetched and the termbase contains more than {{ limit }} concepts, not
        all concepts missing definitions are listed.
      </p>
    </template>
    <div class="">
      <DataTable
        v-if="data && data.length > 0"
        ref="datatable"
        :value="concepts"
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
        <Column field="link" header="Begrep" sortable>
          <template #body="slotProps">
            <AppLink :to="slotProps.data.link">{{
              slotProps.data.concept
            }}</AppLink>
          </template>
        </Column>
      </DataTable>
    </div>
  </UtilsTableWrapper>
</template>

<script setup lang="ts">
const limit = 5000;
const props = defineProps({ termbase: { type: Object, required: true } });

const datatable = ref();

const { data } = useLazyFetch(
  `/api/tb/${props.termbase.id}/missingDefinitions`
);

const concepts = computed(() => {
  if (data.value) {
    return data?.value.map((e) => {
      return {
        concept: e.concept.value
          .split("/")
          .slice(-1)[0]
          .split("-3A")
          .slice(-1)[0],
        link: e.concept.value,
      };
    });
  }
});

const exportCSV = () => {
  datatable.value.exportCSV();
};
</script>
