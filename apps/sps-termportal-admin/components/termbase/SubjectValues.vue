<template>
  <UtilsTableWrapper>
    <template #header>Bruksområder</template>
    <template #description>
      <p>
        The list contains grouped bruksområde values of the termbase. One
        termpost can have multiple values assigned.
      </p>
      <p>
        In some termbases, the order of the values in a termpost carries
        hierarchical information. This information is not preserved in the
        follwing list.
      </p>
      <UtilsTableLegendEntry
        :legend-key="`${data?.length}`"
        legend-value="distinct bruksområde values"
      ></UtilsTableLegendEntry>
    </template>
    <div class="max-w-xl">
      <DataTable
        v-if="data && data.length > 0"
        ref="datatable"
        v-model:filters="filters"
        :value="displayData"
        paginator
        :rows="15"
        removable-sort
        sort-field="subject"
        :sort-order="1"
        table-style="min-width: 1rem"
        :global-filter-fields="['subject']"
      >
        <template #header>
          <div class="flex justify-between">
            <InputText v-model="filters['global'].value" placeholder="Søk" />
            <Button class="h-10" label="Eksport" @click="exportData($event)" />
          </div>
        </template>
        <Column field="subject" header="Bruksområde" sortable />
        <Column field="count" header="Antall" sortable />
      </DataTable>
    </div>
  </UtilsTableWrapper>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

const props = defineProps({ termbase: { type: Object, required: true } });

const datatable = ref();

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const { data } = useLazyFetch(`/api/tb/${props.termbase.id}/subjectValues`, {
  query: { internal: true },
});

const displayData = computed(() => {
  const tmp = data.value?.map((subject) => {
    return { subject: subject.subject.value, count: subject.count.value };
  });

  return tmp;
});

const exportData = () => {
  datatable.value.exportCSV();
};
</script>
