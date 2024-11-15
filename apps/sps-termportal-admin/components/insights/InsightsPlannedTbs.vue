<template>
  <UtilsTableWrapper>
    <template #header>Upubliserte termbaser</template>
    <div class="max-w-5xl">
      <DataTable
        ref="datatable"
        v-model:filters="filters"
        :value="displayData"
        removable-sort
        sort-field="status"
        :sort-order="-1"
        filter-display="row"
        paginator
        :rows="15"
        table-style="min-width: 1rem"
        :global-filter-fields="['label', 'status', 'domain']"
      >
        <template #header>
          <div class="flex justify-between">
            <InputText v-model="filters['global'].value" placeholder="Søk" />
            <Button class="h-10" label="Eksport" @click="exportData()" />
          </div>
        </template>
        <Column field="label" header="Navn" sortable></Column>
        <Column
          sortable
          header="Status"
          field="status"
          filter-field="status"
          :show-filter-menu="false"
        >
          <template #body="{ data }">
            <div class="flex align-items-center gap-2">
              <span>{{ data.status }}</span>
            </div>
          </template>
          <template #filter="{ filterModel, filterCallback }">
            <MultiSelect
              v-model="filterModel.value"
              :options="statuses"
              option-label="name"
              placeholder="Alle"
              class="p-column-filter"
              style="min-width: 10rem"
              :max-selected-labels="0"
              @change="filterCallback()"
            >
              <template #option="slotProps">
                <div class="flex align-items-center gap-2">
                  <span>{{ slotProps.option }}</span>
                </div>
              </template>
            </MultiSelect>
          </template>
        </Column>
        <Column field="topdomain" header="Topdomene" sortable></Column>
        <Column field="domain" header="Domene" sortable></Column>
      </DataTable>
    </div>
  </UtilsTableWrapper>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

const query = `
*[_type == "termbase" && status != 'publisert']{
  label,
  status,
  topdomain,
  domain
}
`;

const { data } = useLazySanityQuery(query);

const displayData = computed(() => {
  const mapped = data.value?.map((tb) => {
    const map = {
      label: tb.label,
      status: numberStatus(tb.status),
      topdomain: topDomains[tb.topdomain],
      domain: tb.domain,
    };
    return map;
  });
  return mapped;
});

const statuses = computed(() => {
  const statusArray = displayData.value?.map((tb) => {
    return tb.status;
  });

  return [...new Set(statusArray)].sort().reverse();
});

const datatable = ref();
const exportData = () => {
  datatable.value.exportCSV();
};
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  status: { value: null, matchMode: FilterMatchMode.IN },
});
</script>
