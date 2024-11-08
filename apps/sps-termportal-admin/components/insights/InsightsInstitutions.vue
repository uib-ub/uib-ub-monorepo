<template>
  <InsightsWrapper>
    <template #header>Institutions participating in termgroups</template>
    <template #description>
      <p>
        List of insitutions with a count of associated people in termgroups that
        have 'opprettet' or 'publisert' termbases.
      </p>
      <p>
        The lookup follows the logic: Organization->Person->Termgroup->Termbase
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
        <Column field="count" header="Personer" sortable></Column>
      </DataTable>
    </div>
  </InsightsWrapper>

  <section></section>
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
            qualifiedMembership[person._ref == ^.^._id]{ timespan },
            "termbase": *[_type == "termbase" &&
                          references(^._id) &&
                          (status == "opprettet" || status == "publisert")]{ id }
          }
      }
  }

  `;
const { data } = useLazySanityQuery(query);

const procdata = computed(() => {
  const mapped = data.value
    ?.filter(
      (orga) =>
        !(
          (
            orga.members.length <= 0 || // filter out organizations without members
            orga._id === "00cde024-d1d6-4631-92b1-b497429a92d0"
          ) // filter out termportalen
        )
    )
    .map((orga) => {
      const map = {
        label: orga.label,
        count: orga.members
          .filter(
            (member) =>
              member.termgroups.map((tg) => tg.termbase).flat().length > 0
          )
          .filter(
            (member) =>
              member.termgroups
                .map((tg) =>
                  tg.qualifiedMembership.filter(
                    (mbs) =>
                      !mbs?.timespan?.endOfTheEnd ||
                      isInFuture(mbs?.timespan?.endOfTheEnd)
                  )
                )
                .flat().length > 0
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
