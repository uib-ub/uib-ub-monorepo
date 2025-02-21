<template>
  <UtilsTableWrapper class="max-w-4xl">
    <template #header>Språk dekning</template>
    <UtilsTableLegend>
      <UtilsTableLegendEntry
        :legend-key="`${procData?.[0]?.concepts}`"
        legend-value="Publiserte begreper"
        legend-width="16"
      />
    </UtilsTableLegend>
    <div class="">
      <DataTable
        v-if="procData.length > 0"
        ref="datatable"
        :value="procData"
        removable-sort
        sort-field="term"
        :sort-order="-1"
        table-style="min-width: 1rem"
      >
        <Column field="label" header="Språk" sortable></Column>
        <Column field="term" header="med term" sortable></Column>
        <Column field="termperc" header="med term i %" sortable></Column>
        <Column field="definition" header="med definisjon" sortable></Column>
        <Column field="defperc" header="med definisjon i %" sortable></Column>
      </DataTable>
    </div>
    <template #legend>
      <p>
        The numbers express how many concepts have at least one term/definition
        in the respective language.
      </p>
    </template>
  </UtilsTableWrapper>
</template>

<script setup>
const props = defineProps({ termbaseId: { type: String, required: true } });

const { data } = await useLazyFetch("/api/tb/all/termbase_language_coverage");

function calcCoveragePerc(concepts, count) {
  if (concepts === 0) return 0;
  return Math.floor((count / concepts) * 100);
}

const procData = computed(() => {
  const tb = data.value?.filter((tb) => tb.tbid.value === props.termbaseId)?.[0];

  if (tb) {
    return [
      {
        label: "Engelsk",
        concepts: tb.concepts.value,
        term: tb.termsen.value,
        termperc: calcCoveragePerc(tb.concepts.value, tb.termsen.value),
        definition: tb.defen.value,
        defperc: calcCoveragePerc(tb.concepts.value, tb.defen.value),
      },
      {
        label: "Bokmål",
        concepts: tb.concepts.value,
        term: tb.termsnb.value,
        termperc: calcCoveragePerc(tb.concepts.value, tb.termsnb.value),
        definition: tb.defnb.value,
        defperc: calcCoveragePerc(tb.concepts.value, tb.defnb.value),
      },
      {
        label: "Norsk",
        concepts: tb.concepts.value,
        term: tb.termsnn.value,
        termperc: calcCoveragePerc(tb.concepts.value, tb.termsnn.value),
        definition: tb.defnn.value,
        defperc: calcCoveragePerc(tb.concepts.value, tb.defnn.value),
      },
    ];
  } else {
    return [];
  }
});
</script>
