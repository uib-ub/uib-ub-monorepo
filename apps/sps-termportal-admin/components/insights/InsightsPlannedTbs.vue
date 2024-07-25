<template>
  <section>
    <h2 class="mb-3 text-xl">Upubliserte termbaser</h2>
    <div class="max-w-4xl">
      <DataTable
        ref="datatable"
        v-model:filters="filters"
        :value="procdata"
        removable-sort
        sort-field="status"
        :sort-order="-1"
        paginator
        :rows="15"
        table-style="min-width: 1rem"
        :global-filter-fields="['label', 'status', 'domain']"
      >
        <template #header>
          <div class="flex justify-between">
            <InputText v-model="filters['global'].value" placeholder="Søk" />
            <Button class="h-10" label="Eksport" @click="exportData($event)" />
          </div>
        </template>
        <Column field="label" header="Navn" sortable></Column>
        <Column field="status" header="Status" sortable></Column>
        <Column field="domain" header="Domene" sortable></Column>
      </DataTable>
    </div>
  </section>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

const query = `
*[_type == "termbase" && status != 'publisert']{
  label,
  status,
  domain
}
`;

const { data } = useLazySanityQuery(query);

const procdata = computed(() => {
  const mapped = data.value?.map((tb) => {
    const map = {
      label: tb.label,
      status: numberStatus(tb.status),
      domain: tb.domain,
    };
    return map;
  });
  return mapped;
});

const datatable = ref();
const exportData = () => {
  datatable.value.exportCSV();
};
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
</script>
