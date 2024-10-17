<template>
  <div class="mt-8 space-y-3">
    <h2 class="mb-3 text-xl">Personer</h2>
    <DataTable
      ref="datatable"
      v-model:filters="filters"
      :value="procdata"
      removable-sort
      paginator
      :rows="15"
      class="max-w-7xl"
      filter-display="row"
      :global-filter-fields="['label', 'organization', 'groupDisplay']"
    >
      <template #header>
        <div class="flex flex-wrap justify-between gap-2">
          <InputText v-model="filters['global'].value" placeholder="Søk" />
          <Button class="h-10" label="Eksport" @click="exportData()" />
        </div>
      </template>
      <Column field="label" header="Navn" sortable />
      <Column header="E-post" field="email" sortable>
        <template #body="{ data }">
          <AppLink
            class="underline hover:decoration-2"
            :to="`mailto:${data.email}`"
            >{{ data?.email }}</AppLink
          >
        </template>
      </Column>
      <Column field="organization" header="Organisasjon" sortable></Column>
      <Column field="groupDisplay" header="Gruppe" sortable></Column>
      <Column field="active" header="Aktiv" sortable data-type="boolean">
        <template #body="{ data }">
          <div class="flex align-items-center gap-2">
            <span>{{ data.active ? "Ja" : "Nei" }}</span>
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <TriStateCheckbox
            v-model="filterModel.value"
            @change="filterCallback()"
          />
        </template>
      </Column>
      <Column>
        <template #body="slotProps">
          <div class="flex">
            <AppLink
              :to="`${studioBaseRoute}/person;${slotProps.data._id}`"
              target="_blank"
              class="hover:bg-gray-100 p-1 rounded"
            >
              Studio
            </AppLink>
          </div>
        </template>
      </Column>
    </DataTable>
    <div class="">
      <dl>
        <div class="flex gap-x-4">
          <dt class="font-semibold">Aktiv</dt>
          <dd>
            Personen er for øyeblikket medlem av en Gruppe eller er
            kontaktperson for en termbase.
          </dd>
        </div>
      </dl>
    </div>
    <pre>{{ procdata }}</pre>
  </div>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

const datatable = ref();
const exportData = () => {
  datatable.value.exportCSV();
};

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  active: { value: null, matchMode: FilterMatchMode.EQUALS },
});
const query = `
  *[_type == "person"]{
    id_,
    label,
    email,
    "group": *[_type == "group" &&
                   references(^._id)
                 ]{
                  _id,
                  label,
                  qualifiedMembership[person._ref == ^.^._id]{role, timespan}
                 },
    "contact": *[_type == "termbase" && references(^._id)]{ label },
    "organization": qualifiedDelegation[]{..., organization->}
    }
`;

const { data } = await useLazySanityQuery(query);

const procdata = computed(() => {
  const tmp = data.value?.map((person) => {
    return {
      _id: person._id,
      label: person.label,
      email: person.email,
      group: person.group.filter(
        (group) =>
          !group?.qualifiedMembership[0]?.timespan?.endOfTheEnd ||
          isInFuture(group?.qualifiedMembership[0]?.timespan?.endOfTheEnd)
      ),
      get groupDisplay() {
        return this.group
          .map(
            (group) =>
              `${group.label} (${group?.qualifiedMembership[0].timespan?.edtf})`
          )
          .join(", ");
      },
      organization: person?.organization
        ?.filter(
          (org) =>
            !org?.timespan?.endOfTheEnd ||
            isInFuture(org?.timespan?.endOfTheEnd)
        )
        .map((org) => `${org?.organization?.label} (${org?.timespan?.edtf})`)
        .join(", "),
      contact: person.contact,
      get active() {
        return !!(this.termgroupDisplay || this.contact.length > 0);
      },
    };
  });

  return tmp;
});
</script>
