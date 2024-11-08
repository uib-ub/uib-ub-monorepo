<template>
  <InsightsWrapper>
    <template #header>People participating in Reference groups</template>
    <div class="max-w-6xl">
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
        <Column field="groups" header="Referansegruppe" sortable></Column>
        <Column field="organization" header="Organisasjon" sortable></Column>
      </DataTable>
    </div>
  </InsightsWrapper>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

// exclude termportalen ansatte, fagråd by id
// TODO only get groups that have a connected termbase
const query = `
*[_type == "person"]{
  _id,
  label,
  qualifiedDelegation[]{
    organization->{ label }
  },
  "groups": *[_type == "group" &&
              references(^._id) &&
              _id != "6a2d2916-6561-4423-ad6e-1763761539d4" &&
              _id != "18974bab-daa5-4fea-803e-0471eb9e76da"
            ]{
              label,
              qualifiedMembership[person._ref == ^.^._id]{
                role,
                timespan
              },
            "consulting": *[_type == "group" &&
                            references(^._id)]{ label }
    }
}
`;

const { data } = useLazySanityQuery(query);

// TODO handle situation where a person leaves and rejoins a group etc.
// currently defaults to first membership
const procdata = computed(() => {
  const mapped = data.value
    ?.filter((person) => person.groups.length > 0)
    .map((person) => {
      const map = {
        label: person.label,
        groups: person.groups
          .filter((group) => group.consulting.length > 0)
          .map(
            (group) =>
              group.label +
              ` (${group.qualifiedMembership[0].timespan.edtf}, ${group.qualifiedMembership[0].role})`
          )
          .join(", "),
        organization: person.qualifiedDelegation
          ?.map((delegation) => delegation.organization.label)
          .join(", "),
        consulting: person.groups,
      };
      return map;
    })
    .filter((person) => person.groups);
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
