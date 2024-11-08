<template>
  <InsightsWrapper>
    <template #header>Analytics: Monthly views per termbase</template>
    <template #description>
      <p>Views of termbase page or concept pages in one termbase per month.</p>
      <p>
        No number in a field means the termbase hasn't been public during that
        month. Data for the month a termbase was published usually doesn't
        contain visits for a whole month.
      </p>
    </template>
    <div>
      <DataTable
        ref="datatable"
        v-model:filters="filters"
        :value="displayData"
        removable-sort
        sort-field="label"
        :sort-order="1"
      >
        <template #header>
          <div class="flex justify-between">
            <InputText v-model="filters['global'].value" placeholder="Søk" />
            <Button class="h-10" label="Eksport" @click="exportData()" />
          </div>
        </template>
        <Column field="label" header="Navn" sortable />
        <Column
          v-for="column in columnDefinitions"
          :key="column.field"
          :field="column.field"
          :header="column.header"
          sortable
        >
        </Column>
      </DataTable>
    </div>
  </InsightsWrapper>
</template>

<script setup lang="ts">
import { FilterMatchMode } from "primevue/api";

const query = `*[_type == "termbase" && status == "publisert"]{ id }`;

const { data: cmsdata } = useLazySanityQuery(query);
const { data: visits } = useFetch("/api/analytics/termbasevisits");
const { data: tboverview } = await useLazyFetch(
  "/api/tb/all/termbase_overview"
);

const displayData = computed(() => {
  const labels = {};
  tboverview?.value?.forEach((tb) => {
    labels[tb.id.value] = tb.label.value;
  });

  const vis = cmsdata?.value?.map((tb) => {
    const tmp = tb;
    tmp.label = labels[tb.id];
    visits?.value?.forEach((partition) => {
      const source = partition["_source"];
      if (tb.id in source) {
        tb[source.date] = source[tb.id];
      } else {
        tb[source.date] = null;
      }
      return { ...tb, ...{ x: "xx" } };
    });
    return tmp;
  });

  const mapped = visits?.value?.map((e) => {
    return e._source;
  });
  return vis;
});

const columnDefinitions = computed(() => {
  return visits?.value?.map((partition) => {
    const date = partition?.["_source"].date;
    return { field: date, header: date };
  });
});

const datatable = ref();
const exportData = () => {
  datatable.value.exportCSV();
};

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
</script>
