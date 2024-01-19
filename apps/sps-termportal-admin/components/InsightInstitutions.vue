<template>
  <section>
    <h2 class="mb-3 text-xl">Institutions participating in termgroups</h2>
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
      <Column field="count" header="Personer" sortable></Column>
    </DataTable>
  </section>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

const query = `
  *[_type == "organization"]
  { _id,
    label,
    "members":
      *[_type == "person" && references(^._id)]
       {
        _id,
        label,
        "termgroups":
          *[_type == "group" && references(^._id)]
          {
            label,
            qualifiedMembership[]{ timespan }
          }
      }
  }

  `;
const { data } = useLazySanityQuery(query);

const procdata = computed(() => {
  const mapped = data.value
    ?.filter(
      (group) =>
        !(
          (
            group.members.length <= 0 || // filter out organizations without members
            group._id === "00cde024-d1d6-4631-92b1-b497429a92d0"
          ) // filter out termportalen
        )
    )
    .map((group) => {
      const map = {
        label: group.label,
        count: group.members.filter((member) => member.termgroups.length > 0)
          .length,
      };
      return map;
    })
    .filter((group) => group.count > 0);
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
