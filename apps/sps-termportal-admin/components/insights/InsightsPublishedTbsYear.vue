<template>
  <InsightsWrapper>
    <template #header>Published Termbases by Year</template>
    <div class="max-w-xl">
      <DataTable
        ref="datatable"
        v-model:filters="filters"
        :value="procdata"
        removable-sort
        sort-field="year"
        :sort-order="-1"
        paginator
        :rows="15"
        table-style="min-width: 1rem"
        :global-filter-fields="['year']"
      >
        <template #header>
          <div class="flex justify-between">
            <InputText v-model="filters['global'].value" placeholder="Søk" />
            <Button class="h-10" label="Eksport" @click="exportData($event)" />
          </div>
        </template>
        <Column field="year" header="År" sortable></Column>
        <Column field="count" header="Antall" sortable></Column>
      </DataTable>
    </div>
  </InsightsWrapper>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

const query = `
*[_type == "activity" && type == 'termbasePublisering']{
  "date": timespan.beginOfTheBegin
}
`;

const { data } = useLazySanityQuery(query);

const procdata = computed(() => {
  const mapped = data.value?.map((entry) => entry.date.substring(0, 4));
  if (mapped) {
    const counts = Object.entries(
      mapped?.reduce((acc, year) => {
        acc[year] = (acc[year] || 0) + 1;
        return acc;
      }, {})
    ).map(([year, count]) => ({ year: parseInt(year), count }));
    return counts;
  }
  return [];
});

const datatable = ref();
const exportData = () => {
  datatable.value.exportCSV();
};
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
</script>
