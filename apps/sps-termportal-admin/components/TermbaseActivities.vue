<template>
  <div class="">
    <h2 class="my-6 text-xl font-semibold">Termbase Activities</h2>
    <DataTable
      ref="datatable"
      v-model:filters="filters"
      v-model:expandedRows="expandedRows"
      :value="procdata"
      removable-sort
      paginator
      :rows="15"
      filter-display="row"
      sort-field="start"
      :sort-order="-1"
    >
      <template #header>
        <div class="flex justify-between">
          <InputText v-model="filters['global'].value" placeholder="Søk" />
          <div class="space-x-4">
            <Button class="h-10" text label="Expand All" @click="expandAll" />
            <Button
              class="h-10"
              text
              label="Collapse All"
              @click="collapseAll"
            />
            <Button class="h-10" label="Eksport" @click="exportData()" />
          </div>
        </div>
      </template>
      <Column expander style="width: 3rem" />
      <Column field="label" header="Label" sortable />
      <Column
        sortable
        header="Type"
        filter-field="type"
        :show-filter-menu="false"
      >
        <template #body="{ data }">
          <div class="flex align-items-center gap-2">
            <span>{{ data.type }}</span>
          </div>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <MultiSelect
            v-model="filterModel.value"
            :options="activityTypesPresent"
            option-label="type"
            placeholder="Alle"
            class="p-column-filter"
            style="min-width: 10rem"
            :max-selected-labels="0"
            @change="filterCallback()"
          >
            <template #option="slotProps">
              <div class="flex align-items-center gap-2">
                <span>{{ slotProps.option }}</span>
              </div>
            </template>
          </MultiSelect>
        </template>
      </Column>
      <Column field="start" header="Start" sortable>
        <template #body="slotProps">
          {{ prettyPrintDate(slotProps.data.start) }}
        </template>
      </Column>
      <Column field="end" header="Slutt" sortable>
        <template #body="slotProps">
          {{ prettyPrintDate(slotProps.data.end) }}
        </template>
      </Column>
      <Column field="termbase" header="Termbase" sortable />
      <Column header="">
        <template #body="slotProps">
          <div class="flex">
            <AppLink
              :to="`/studio/desk/activity;${slotProps.data.id}`"
              target="_blank"
              class="hover:bg-gray-100 p-1 rounded"
            >
              Studio
            </AppLink>
          </div>
        </template>
      </Column>
      <template #expansion="slotProps">
        <div class="p-4 space-y-3 max-w-3xl">
          <div v-if="slotProps.data.note" class="content-page">
            <h2 class="text-lg py-1 font-semibold">Merknad</h2>
            <TpSanityContent :blocks="slotProps.data.note" />
          </div>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

const props = defineProps({ termbases: { type: Object, required: true } });

const datatable = ref();
const expandedRows = ref([]);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  type: { value: null, matchMode: FilterMatchMode.IN },
});

const tbString = Object.keys(props.termbases).map((tb) => `'${tb}'`);
const query = `
*[_type == "activity"]{
  _id,
  label,
  type,
  note,
  timespan,
  qualifiedUsage[ scope._ref == 'eb281dfd-073c-4a9e-b2a0-95a6e25f3516' &&
                  termbase._ref in [${tbString}] ]{
                    termbase
                  }
}
  `;

const { data } = useLazySanityQuery(query);

const procdata = computed(() => {
  const tmp = data.value
    ?.filter(
      (activity) =>
        activity.qualifiedUsage && activity.qualifiedUsage.length > 0
    )
    .map((activity) => {
      return {
        id: activity._id,
        label: activity?.label,
        type: activityTypes[activity.type] || activity?.type,
        note: activity?.note,
        start: activity.timespan?.beginOfTheBegin?.substring(0, 10),
        end: activity.timespan?.endOfTheEnd?.substring(0, 10),
        termbase: activity?.qualifiedUsage
          ?.map((usage) => props.termbases[usage.termbase._ref])
          .join(", "),
      };
    });

  return tmp;
});

const activityTypesPresent = computed(() => {
  const typeArray = procdata.value?.map((tb) => {
    return tb.type;
  });

  return [...new Set(typeArray)].sort().reverse();
});

const exportData = () => {
  datatable.value.exportCSV();
};

const expandAll = () => {
  expandedRows.value = procdata.value;
};
const collapseAll = () => {
  expandedRows.value = null;
};
</script>
