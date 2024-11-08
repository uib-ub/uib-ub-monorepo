<template>
  <InsightsWrapper>
    <template #header> Institutions responsible for termbases </template>
    <template #description>
      <p>
        List of institutions registered as responsible for one or more
        termbases. Only termbases that have the status 'opprettet' or
        'publisert' are included in the count.
      </p>
    </template>
    <div class="max-w-3xl">
      <DataTable
        ref="datatable"
        v-model:filters="filters"
        :value="procdata"
        removable-sort
        sort-field="count"
        :sort-order="-1"
        table-style="min-width: 1rem"
        :global-filter-fields="['label']"
      >
        <template #header>
          <div class="flex justify-between">
            <InputText v-model="filters['global'].value" placeholder="Søk" />
            <Button class="h-10" label="Eksport" @click="exportData($event)" />
          </div>
        </template>
        <Column field="label" header="Navn" sortable></Column>
        <Column field="count" header="Termbaser" sortable></Column>
      </DataTable>
    </div>
  </InsightsWrapper>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

const query = `
    *[_type == "organization"]
    { _id,
      label,
      "termbases": *[_type == "termbase" &&
                     references(^._id) &&
                     (status == 'publisert' || status == 'opprettet')]{
        qualifiedAttribution[group._ref == ^.^._id]{...}
      }
    }
    `;
const { data } = useLazySanityQuery(query);

const procdata = computed(() => {
  const mapped = data.value
    ?.map((orga) => {
      const map = {
        label: orga.label,
        count: orga.termbases.filter(
          (tb) => tb.qualifiedAttribution && tb.qualifiedAttribution.length > 0
        ).length,
      };
      return map;
    })
    .filter((orga) => orga.count > 0);
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
