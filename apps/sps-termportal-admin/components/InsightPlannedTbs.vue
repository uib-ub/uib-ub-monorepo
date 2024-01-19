<template>
  <section>
    <h2 class="mb-3 text-xl">Upubliserte termbaser</h2>
    <DataTable
      ref="datatable"
      v-model:filters="filters"
      :value="procdata"
      removable-sort
      paginator
      :rows="15"
      table-style="min-width: 1rem"
      :global-filter-fields="['label', 'termgroup', 'organization']"
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

const statusopt = {
  kjent: "1. kjent",
  planlagt: "2. planlagt",
  initialisert: "3. initialisert",
  opprettet: "4. opprettet",
};

const procdata = computed(() => {
  const mapped = data.value?.map((tb) => {
    const status = () => {
      switch (tb.status) {
        case "kjent":
          return `1. ${tb.status}`;
        case "planlagt":
          return `2. ${tb.status}`;
        case "initialisert":
          return `3. ${tb.status}`;
        case "opprettet":
          return `4. ${tb.status}`;
      }
    };
    const map = {
      label: tb.label,
      status: status(),
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
