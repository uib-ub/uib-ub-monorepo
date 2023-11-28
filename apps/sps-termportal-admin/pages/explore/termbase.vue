<template>
  <div class="flex">
    <SideBar />
    <main class="space-y-4">
      <section>
        <h1 class="mb-6 text-2xl">Explore Termbases</h1>
        <DataTable
          v-model:selection="selectedTermbase"
          selection-mode="single"
          :value="termbases"
          removable-sort
          table-style="min-width: 1rem"
        >
          <Column
            v-for="col of columns"
            :key="col.field"
            :field="col.field"
            :header="col.header"
            sortable
          ></Column>
        </DataTable>
      </section>
      <ExploreDefinitions
        v-if="selectedTermbase"
        :key="`exploredef${selectedTermbase?.id}`"
        :termbase="selectedTermbase"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
const { data } = await useLazyFetch("/api/overview/fuseki");

const termbases = computed(() => {
  return data.value?.results?.bindings.map((e) => {
    return {
      label: e.label.value,
      id: e.id.value,
      conceptCount: e.concepts.value,
    };
  });
});
const columns = [
  { field: "label", header: "Label" },
  { field: "id", header: "ID" },
  { field: "conceptCount", header: "Concepts" },
];

const selectedTermbase = ref();
</script>
