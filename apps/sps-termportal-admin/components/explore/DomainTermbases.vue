<template>
  <section class="space-y-3">
    <h2 class="text-2xl">Termbases in domain: {{ domain.nb }}</h2>
    <div class="space-y-4">
      <div>
        <p>
          Tables display which termbases actually define concepts in the
          selected domain. It doesn't show which termbases <i>could</i> do so.
        </p>
      </div>
      <div class="space-y-2">
        <h3 class="text-xl">Directly defined in domain</h3>
        <DataTable
          :value="displayData"
          removable-sort
          sort-field="concepts"
          :sort-order="-1"
          table-style="min-width: 1rem"
        >
          <Column sortable field="label" header="Bokmål" />
          <Column sortable field="concepts" header="Begreper" />
        </DataTable>
      </div>

      <div class="space-y-2">
        <h3 class="text-xl">Defined in subdomains</h3>
        <DataTable
          :value="displayDataRec"
          removable-sort
          sort-field="concepts"
          :sort-order="-1"
          table-style="min-width: 1rem"
        >
          <Column sortable field="label" header="Bokmål" />
          <Column sortable field="concepts" header="Begreper" />
        </DataTable>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps({ domain: { type: Object, required: true } });

const { data } = await useLazyFetch(
  `/api/domain/${props.domain.id}/exploreDomainTermbases`,
  {
    query: { internal: true },
  }
);

const displayData = computed(() => {
  return data.value?.results?.bindings?.map((tb) => {
    return { label: tb.label.value, concepts: tb.concepts.value };
  });
});

const { data: dataRec } = await useLazyFetch(
  `/api/domain/${props.domain.id}/exploreDomainTermbasesRec`,
  {
    query: { internal: true },
  }
);

const displayDataRec = computed(() => {
  return dataRec.value?.results?.bindings.map((tb) => {
    return { label: tb.label.value, concepts: tb.concepts.value };
  });
});
</script>
