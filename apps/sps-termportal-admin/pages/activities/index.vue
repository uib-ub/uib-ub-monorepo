<template>
  <div class="flex">
    <SideBar></SideBar>
    <main class="pt-8">
      <h1 class="mb-6 text-2xl">Activities</h1>
      <DataTable
        v-model:filters="filters"
        v-model:expandedRows="expandedRows"
        :value="procdata"
        removable-sort
        paginator
        :rows="15"
        sort-field="start"
        :sort-order="-1"
        :global-filter-fields="['label', 'type', 'start', 'end']"
      >
        <template #header>
          <div class="flex flex-wrap justify-between gap-2">
            <div class="flex">
              <InputText v-model="filters['global'].value" placeholder="Søk" />
            </div>
            <div>
              <Button class="h-10" text label="Expand All" @click="expandAll" />
              <Button
                class="h-10"
                text
                label="Collapse All"
                @click="collapseAll"
              />
            </div>
          </div>
        </template>

        <Column expander style="width: 5rem" />
        <Column field="label" header="Label" sortable />
        <Column field="type" header="Type" sortable />
        <Column field="start" header="Start" sortable />
        <Column field="end" header="Slutt" sortable />
        <Column header="">
          <template #body="slotProps">
            <NuxtLink
              :to="`${studioBaseRoute}/activity;${slotProps.data.id}`"
              target="_blank"
            >
              Rediger
            </NuxtLink>
          </template>
        </Column>
        <template #expansion="slotProps">
          <div class="p-4 space-y-3">
            <div v-if="slotProps.data.note" class="content-page">
              <h2 class="text-lg py-1 font-semibold">Merknad</h2>
              <TpSanityContent :blocks="slotProps.data.note" />
            </div>
            <div v-if="slotProps.data.scope">
              <h2 class="text-lg py-1 font-semibold">Scope</h2>
              <DataTable :value="slotProps.data.scope">
                <Column field="scope" header="Scope" sortable />
                <Column field="subscope" header="Subscope" sortable />
              </DataTable>
            </div>
          </div>
        </template>
      </DataTable>
    </main>
  </div>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

const expandedRows = ref([]);
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const expandAll = () => {
  expandedRows.value = procdata.value;
};
const collapseAll = () => {
  expandedRows.value = null;
};

const query = `
*[_type == "activity"]{
  _id,
  label,
  type,
  note,
  "start": timespan.beginOfTheBegin,
  "end": timespan.endOfTheEnd,
  "edtf": timespan.edtf,
  qualifiedUsage[]{
    "scope": scope->.label,
    "subscope": subscope->.label,
    "termbase": termbase->.label,
    "group": group->.label
  }
}`;

const { data } = await useLazySanityQuery(query);

const procdata = computed(() =>
  data.value?.map((a) => {
    const tmp = {
      id: a._id,
      label: a.label,
      type: activityTypes[a.type],
      scope: a.qualifiedUsage?.map((usage) => {
        if (usage.scope === "Termbase") {
          return { scope: usage.scope, subscope: usage.termbase };
        } else if (usage.scope === "Gruppe") {
          return { scope: usage.scope, subscope: usage.group };
        } else {
          return { scope: usage.scope, subscope: usage.subscope };
        }
      }),
      note: a.note,
      start: a.start?.substring(0, 10),
      end: a.end?.substring(0, 10),
    };
    return tmp;
  })
);
</script>
