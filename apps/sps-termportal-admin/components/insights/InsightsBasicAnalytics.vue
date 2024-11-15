<template>
  <UtilsTableWrapper>
    <template #header>Basic Analytics</template>
    <div class="max-w-3xl">
      <DataTable
        ref="datatable"
        :value="procdata"
        removable-sort
        sort-field="date"
        :sort-order="-1"
        paginator
        :rows="15"
        table-style="min-width: 1rem"
      >
        <template #header>
          <div class="flex justify-between">
            <Button class="h-10" label="Eksport" @click="exportData()" />
          </div>
        </template>
        <Column field="date" header="Date" sortable></Column>
        <Column field="visits" header="Visits" sortable></Column>
        <Column field="pageviews" header="Pageviews" sortable></Column>
        <Column field="searches" header="Searches" sortable></Column>
      </DataTable>
    </div>
    <template #legend>
      <div class="space-y-1.5">
        <p>
          People who use an ad blocker are not included in the data. This means
          the "real" events are undercounted. Depending on demographic etc.
          approximatly 30%-40% use ad blockers.
        </p>
        <p>
          <span class="font-bold">Visit: </span>Uninterrupted visit of
          termportalen.no. Reloading the page or (technically) leaving an
          revisiting the page later etc. are counted as separate visits.
        </p>
        <p>
          <span class="font-bold">Pageview: </span>View of a single page.
          Revisiting the same page or navigation back are counted as a separate
          views.
        </p>
        <p>
          <span class="font-bold">Search: </span> Every visit and change of the
          /search route. I.e. navigating back and changing search options are
          counted as separate searches. Changing filter options is not. Custom
          events provide more detailed information regarding searches.
        </p>
      </div>
    </template>
  </UtilsTableWrapper>
</template>

<script setup lang="ts">
const { data } = useFetch("/api/analytics/overview");

const procdata = computed(() => {
  const mapped = data.value?.map((e) => {
    return e._source;
  });
  return mapped;
});

const datatable = ref();
const exportData = () => {
  datatable.value.exportCSV();
};
</script>
