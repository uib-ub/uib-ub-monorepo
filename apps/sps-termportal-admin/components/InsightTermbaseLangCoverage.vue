<template>
  <section>
    <h2 class="mb-3 text-xl">Termbases: Language coverage</h2>
    <DataTable
      ref="datatable"
      v-model:filters="filters"
      :value="procdata"
      removable-sort
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
      <Column field="count" header="Begreper" sortable />
      <Column field="tnb" header="med bokmål term" sortable />
      <Column field="tnn" header="med nynorsk term" sortable />
      <Column field="ten" header="med engelsk term" sortable />
      <Column field="dnb" header="med bokmål definisjon" sortable />
      <Column field="dnn" header="med nynorsk definisjon" sortable />
      <Column field="den" header="med engelsk definisjon" sortable />
    </DataTable>
  </section>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

const { data } = await useLazyFetch("/api/tb/all/insightTermbase");

const procdata = computed(() => {
  const mapped = data.value?.results?.bindings.map((tb) => {
    const map = {
      label: tb.label.value,
      count: tb.concepts.value,
      tnb: tb.termsNb.value,
      tnn: tb.termsNn.value,
      ten: tb.termsEn.value,
      dnb: tb.defNb.value,
      dnn: tb.defNn.value,
      den: tb.defEn.value,
    };
    return map;
  });

  const filtered = mapped?.filter((value, index) => {
    const _value = JSON.stringify(value);
    return (
      index ===
      mapped?.findIndex((obj) => {
        return JSON.stringify(obj) === _value;
      })
    );
  });

  return filtered;
});

const datatable = ref();
const exportData = () => {
  datatable.value.exportCSV();
};
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
</script>
