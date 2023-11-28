<template>
  <div class="flex">
    <SideBar></SideBar>
    <main class="space-y-8 py-8">
      <h1 class="text-2xl">Termbase Insights</h1>
      <section>
        <h2 class="mb-4 text-xl">Termbaser</h2>
        <DataTable
          :value="termbases"
          removableSort
          tableStyle="min-width: 1rem"
          selectionMode="single"
          v-model:selection="selectedTermbase"
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
