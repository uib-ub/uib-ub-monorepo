<template>
  <section>
    <AppLink to="#tbmembers">
      <h2 id="tbmembers" class="my-6 text-2xl">Termgruppe</h2>
    </AppLink>
    <DataTable
      ref="datatable"
      v-model:filters="filters"
      :value="procdata"
      removable-sort
      paginator
      :rows="15"
      filter-display="row"
      :global-filter-fields="['label', 'email', 'group', 'role', 'institution']"
    >
      <template #header>
        <div class="flex justify-between">
          <InputText v-model="filters['global'].value" placeholder="Søk" />
          <Button class="h-10" label="Eksport" @click="exportData()" />
        </div>
      </template>
      <Column header="Navn" field="label" sortable />
      <Column header="E-post" field="email" sortable>
        <template #body="{ data }">
          <AppLink
            class="underline hover:decoration-2"
            :to="`mailto:${data.email}`"
            >{{ data?.email }}</AppLink
          >
        </template>
      </Column>
      <Column header="Termgruppe" field="group" sortable />
      <Column header="Aktiv" field="active" sortable data-type="boolean">
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
      <Column header="Rolle" field="role" sortable />

      <Column header="Organisasjon" field="institution" sortable />
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
  </section>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

const props = defineProps({ termbases: { type: Array, required: true } });

const datatable = ref();
const exportData = () => {
  datatable.value.exportCSV();
};

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  active: { value: null, matchMode: FilterMatchMode.EQUALS },
});

const tbString = props.termbases.map((tb) => `'${tb}'`);
const query = `
*[_type == "person"]{
  _id,
  label,
  email,
  "institution": qualifiedDelegation[!defined(timespan.endOfTheEnd)]{timespan, "organization": organization->label},
  "termgroup": *[_type == "group" &&
                 references(^._id)
                 ]{
                  _id,
                  label,
                  qualifiedMembership[person._ref == ^.^._id]{role, timespan},
                  "termbase": *[_type == "termbase" &&
                                references(^._id) &&
                                _id in [${tbString}]
                              ]
                 }
}

`;

const { data } = useLazySanityQuery(query);

const procdata = computed(() => {
  const tmp = data.value
    ?.map((person) => {
      const data = {
        _id: person._id,
        label: person?.label,
        email: person?.email,
        institution: person?.institution,
        termgroups: person?.termgroup.filter(
          (group) => group.termbase.length > 0
        ),
      };
      return data;
    })
    .filter((person) => person.termgroups.length > 0)
    .map((person) => {
      return {
        _id: person._id,
        label: person.label,
        email: person.email,
        institution: person.institution
          ?.map(
            (delegation) =>
              `${delegation.organization} (${delegation?.timespan?.edtf})`
          )
          .join(", "),
        group: person.termgroups
          .map(
            (group) =>
              `${group.label} (${group?.qualifiedMembership[0]?.timespan?.edtf})`
          )
          .join(", "),
        role: person.termgroups
          .map((group) =>
            group.qualifiedMembership.map((membership) => membership.role)
          )
          .join(", "),
        start: person.termgroups
          .map((group) =>
            group.qualifiedMembership.map(
              (membership) =>
                membership?.timespan?.beginOfTheBegin?.substring(0, 10) ||
                undefined
            )
          )
          .flat()
          .join(", "),
        end: person.termgroups
          .map((group) =>
            group.qualifiedMembership.map((membership) =>
              membership?.timespan?.endOfTheEnd?.substring(0, 10)
            )
          )
          .flat()
          .filter((end) => end)
          .join(", "),

        get active() {
          return !(
            this.end &&
            this.end
              .split(", ")
              .map((end) => !isInFuture(end))
              .filter((end) => end).length > 0
          );
        },
      };
    });

  return tmp;
});
</script>
