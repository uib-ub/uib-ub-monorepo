<template>
  <section>
    <h2 class="mb-3 text-xl">Referansegrupper</h2>
    <div class="max-w-7xl">
      <DataTable
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
        <Column field="label" header="Navn referansegruppe" sortable />
        <Column field="count" header="Medlemmer" sortable />
        <Column field="timespan" header="Tidsrom" sortable />
        <Column field="termgroup" header="Termgruppe" sortable />
      </DataTable>
    </div>
  </section>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

// filter out
const query = `
*[_type == "group" && _id != "18974bab-daa5-4fea-803e-0471eb9e76da"]{
  _id,
  label,
  qualifiedMembership[]{},
  "termgroups": *[_type == "group" && references(^._id)]{
    label,
    qualifiedConsultation[group._ref == ^.^._id]{
      timespan{edtf}
    }
  }
}
`;
const { data } = useLazySanityQuery(query);

// TODO handle situation where one group consults multiple termgroups
const procdata = computed(() => {
  const mapped = data.value
    ?.filter((group) => group.termgroups.length > 0)
    .map((group) => {
      const map = {
        label: group.label,
        count: group.qualifiedMembership ? group.qualifiedMembership.length : 0,
        timespan: group.termgroups[0].qualifiedConsultation[0].timespan?.edtf,
        termgroup: group.termgroups[0].label,
        // count: group.members.filter((member) => member.termgroups.length > 0)
        //   .length,
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
