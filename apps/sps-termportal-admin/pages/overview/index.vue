<template>
  <div class="flex">
    <SideBar></SideBar>
    <main class="pt-8">
      <h1 class="mb-6 text-2xl">Termbase Overview</h1>
      <DataTable :value="products" removable-sort table-style="min-width: 1rem">
        <Column
          v-for="col of columns"
          :key="col.field"
          :field="col.field"
          :header="col.header"
          sortable
        ></Column>
      </DataTable>
    </main>
  </div>
</template>

<script setup lang="ts">
const { data } = await useLazyFetch("/api/overview/fuseki");

const products = computed(() => {
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
</script>
