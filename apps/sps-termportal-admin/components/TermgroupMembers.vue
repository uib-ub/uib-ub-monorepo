<template>
  <section>
    <h2 class="my-6 text-xl">Termgroup members</h2>
    <DataTable
      v-model:filters="filters"
      :value="procdata"
      removable-sort
      paginator
      :rows="15"
      filter-display="row"
    >
      <Column header="Navn" field="label" sortable />
      <Column header="Termgruppe" field="group" sortable />
      <Column header="Rolle" field="role" sortable />
      <Column header="Start" field="start" sortable>
        <template #body="slotProps">
          {{ prettyPrintDate(slotProps.data.start) }}
        </template>
      </Column>
      <Column header="Slutt" field="end" sortable>
        <template #body="slotProps">
          {{ prettyPrintDate(slotProps.data.end) }}
        </template>
      </Column>
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
    </DataTable>
  </section>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

const props = defineProps({ termbases: { type: Array, required: true } });

const filters = ref({
  active: { value: null, matchMode: FilterMatchMode.EQUALS },
});

const tbString = props.termbases.map((tb) => `'${tb}'`);
const query = `
*[_type == "person"]{
  _id,
  label,
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
        label: person?.label,
        termgroups: person?.termgroup.filter(
          (group) => group.termbase.length > 0
        ),
      };
      return data;
    })
    .filter((person) => person.termgroups.length > 0)
    .map((person) => {
      return {
        label: person.label,
        group: person.termgroups.map((group) => group.label).join(", "),
        role: person.termgroups
          .map((group) =>
            group.qualifiedMembership.map((membership) => membership.role)
          )
          .join(", "),
        start: person.termgroups
          .map((group) =>
            group.qualifiedMembership.map((membership) =>
              membership?.timespan?.beginOfTheBegin.substring(0, 10)
            )
          )
          .join(", "),
        end: person.termgroups
          .map((group) =>
            group.qualifiedMembership.map(
              (membership) =>
                membership?.timespan?.endOfTheEnd?.substring(0, 10) || undefined
            )
          )
          .filter((end) => !end)
          .join(", "),
        get active() {
          return !this.end;
        },
      };
    });

  return tmp;
});
</script>
