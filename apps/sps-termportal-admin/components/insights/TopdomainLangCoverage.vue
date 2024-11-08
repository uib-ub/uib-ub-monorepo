<template>
  <section class="space-y-3">
    <h2 class="mb-3 text-xl">Topdomains: Language coverage</h2>
    <div class="space-y-1 max-w-3xl">
      <p>
        Includes all topdomains and only counts published concepts from
        published termbases.
      </p>
    </div>
    <div class="max-w-5xl">
      <DataTable
        ref="datatable"
        v-model:filters="filters"
        :value="displayData"
        removable-sort
        sort-field="label"
        :sort-order="1"
        table-style="min-width: 1rem"
        :global-filter-fields="['label']"
      >
        <template #header>
          <div class="flex justify-between">
            <InputText v-model="filters['global'].value" placeholder="Søk" />
            <Button class="h-10" label="Eksport" @click="exportData($event)" />
          </div>
        </template>
        <Column field="label" header="Navn" sortable />
        <Column field="concepts" header="Begreper" sortable />
        <Column field="nb" header="med bokmål term" sortable />
        <Column field="nn" header="med nynorsk term" sortable />
        <Column field="en" header="med engelsk term" sortable />
      </DataTable>
    </div>
  </section>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

const datatable = ref();
const exportData = () => {
  datatable.value.exportCSV();
};
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const { data } = await useLazyFetch(
  "/api/domain/all/topdomain_language_coverage"
);

const displayData = computed(() => {
  return data?.value?.map((domain) => {
    const map = {
      label: domain.label.value,
      concepts: domain.concepts.value,
      nb: domain.termsnb.value,
      nn: domain.termsnn.value,
      en: domain.termsen.value,
    };
    return map;
  });
});
</script>
